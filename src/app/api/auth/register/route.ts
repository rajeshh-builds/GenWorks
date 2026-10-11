import { NextRequest, NextResponse } from "next/server";
import { upsertClientUser, findUserByEmail } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
import {
  createSessionToken,
  sanitizeInput,
  checkRateLimit,
  getClientIp,
  verifyAllowedOrigin,
  applySecurityHeaders,
} from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF / Origin Verification
    if (!verifyAllowedOrigin(req)) {
      const res = NextResponse.json(
        { success: false, error: "Cross-site request blocked." },
        { status: 403 }
      );
      return applySecurityHeaders(res);
    }

    // 2. Rate Limiting (max 10 registration attempts / min / IP)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`auth:register:${ip}`, 10, 60000);
    if (!rateLimit.allowed) {
      const res = NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please try again shortly.",
          retryAfter: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
      res.headers.set("Retry-After", String(rateLimit.resetInSeconds));
      return applySecurityHeaders(res);
    }

    // 3. Parse & Sanitize Input
    const rawBody = await req.json();
    const body = sanitizeInput(rawBody);
    const { email, name, category, firebaseUid } = body;

    if (!email) {
      const res = NextResponse.json(
        { success: false, error: "Work email is required." },
        { status: 400 }
      );
      return applySecurityHeaders(res);
    }

    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const res = NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 }
      );
      return applySecurityHeaders(res);
    }

    // 4. Upsert User in MongoDB Atlas clientora.User collection
    const user = await upsertClientUser({
      email,
      name: name || email.split("@")[0],
      category: category || "brand",
      authProvider: "credentials",
      firebaseUid,
    });

    if (!user) {
      throw new Error("Failed to persist client record in database.");
    }

    // 5. Issue Cryptographic Session Token
    const token = await createSessionToken({
      sub: firebaseUid || user._id?.toString() || email,
      email: user.email,
      name: user.name,
      role: "CLIENT",
      category: user.category,
    });

    // 6. Build Protected Response with HTTP-Only Cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        category: user.category,
      },
    });

    response.cookies.set({
      name: "clientora_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return applySecurityHeaders(response);
  } catch (err: unknown) {
    console.error("[API Error] /api/auth/register:", err);
    const res = NextResponse.json(
      { success: false, error: "Registration service error." },
      { status: 500 }
    );
    return applySecurityHeaders(res);
  }
}
