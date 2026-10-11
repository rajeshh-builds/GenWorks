import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
import {
  requireClientAuth,
  sanitizeInput,
  applySecurityHeaders,
} from "@/lib/security";

/**
 * GET /api/client/profile - Secure Client Profile Retrieval
 * Protected by Cryptographic Session Token & Role Guard
 */
export async function GET(req: NextRequest) {
  const auth = await requireClientAuth(req);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const user = await findUserByEmail(auth.user.email);
    if (!user) {
      const res = NextResponse.json(
        { success: false, error: "Client record not found in system." },
        { status: 404 }
      );
      return applySecurityHeaders(res);
    }

    const res = NextResponse.json({
      success: true,
      profile: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        category: user.category,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });

    return applySecurityHeaders(res);
  } catch (err: unknown) {
    console.error("[API Error] GET /api/client/profile:", err);
    const res = NextResponse.json(
      { success: false, error: "Failed to fetch secure client profile." },
      { status: 500 }
    );
    return applySecurityHeaders(res);
  }
}

/**
 * PATCH /api/client/profile - Secure Client Profile Update
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireClientAuth(req);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);

    const db = await getDb();
    const users = db.collection("User");

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (body.name && typeof body.name === "string") {
      updateFields.name = body.name.slice(0, 80);
    }
    if (body.category && typeof body.category === "string") {
      updateFields.category = body.category;
    }

    await users.updateOne(
      { email: auth.user.email },
      { $set: updateFields }
    );

    const res = NextResponse.json({
      success: true,
      message: "Client profile securely updated.",
    });

    return applySecurityHeaders(res);
  } catch (err: unknown) {
    console.error("[API Error] PATCH /api/client/profile:", err);
    const res = NextResponse.json(
      { success: false, error: "Failed to update client profile." },
      { status: 500 }
    );
    return applySecurityHeaders(res);
  }
}
