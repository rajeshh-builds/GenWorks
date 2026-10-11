/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firebaseUid, email, name, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Connect to MongoDB using Prisma
    // Upsert User: if exists, return. if not, create.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        ...(name ? { name } : {}),
      },
      create: {
        email,
        name: name || "",
        role: role || "CREATOR",
      },
    });

    // If it's a creator, ensure a CreatorProfile exists linked to them
    let creatorProfile = null;
    if (user.role === "CREATOR" || !user.role) {
      creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!creatorProfile) {
        creatorProfile = await prisma.creatorProfile.create({
          data: {
            userId: user.id,
            bio: "AI Content Creator on GenWorks",
            tools: ["Midjourney v6", "Runway Gen-3"],
            isVerified: false,
            verificationScore: 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, user, creatorProfile }, { status: 200 });
  } catch (error: any) {
    console.error("Error syncing user to MongoDB:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
