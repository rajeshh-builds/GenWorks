import { MongoClient, Db, Collection, Document } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  // Graceful handling during build time
  if (process.env.NODE_ENV === "production" && !process.env.CI) {
    console.warn("Please add your MONGODB_URI to .env.local");
  }
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise && uri) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise || (uri ? new MongoClient(uri, options).connect() : Promise.reject(new Error("MONGODB_URI is not defined")));
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = uri ? new MongoClient(uri, options).connect() : Promise.reject(new Error("MONGODB_URI is not defined"));
}

export default clientPromise;

/**
 * Returns database instance (default: "clientora")
 */
export async function getDb(dbName = "clientora"): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

/**
 * Returns the clientora User collection
 */
export async function getUsersCollection(): Promise<Collection<Document>> {
  const db = await getDb("clientora");
  return db.collection("User");
}

export interface ClientUserDoc {
  email: string;
  name: string;
  role: "CLIENT" | "BRAND";
  category?: "brand" | "agency" | "individual";
  authProvider: "google" | "credentials";
  firebaseUid?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  balanceInEscrow?: number;
}

/**
 * Find user by email in MongoDB clientora.User collection
 */
export async function findUserByEmail(email: string) {
  const users = await getUsersCollection();
  return users.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Upsert client user upon Firebase Google login or registration
 */
export async function upsertClientUser(userData: {
  email: string;
  name: string;
  category?: "brand" | "agency" | "individual";
  authProvider: "google" | "credentials";
  firebaseUid?: string;
  avatarUrl?: string;
  passwordHash?: string;
}) {
  const users = await getUsersCollection();
  const normalizedEmail = userData.email.toLowerCase().trim();

  const now = new Date();
  const result = await users.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name: userData.name || normalizedEmail.split("@")[0],
        category: userData.category || "brand",
        authProvider: userData.authProvider,
        firebaseUid: userData.firebaseUid,
        avatarUrl: userData.avatarUrl,
        updatedAt: now,
        ...(userData.passwordHash ? { passwordHash: userData.passwordHash } : {}),
      },
      $setOnInsert: {
        email: normalizedEmail,
        role: "BRAND",
        createdAt: now,
        balanceInEscrow: 0,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return result;
}
