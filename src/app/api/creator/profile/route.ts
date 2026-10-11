import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    let whereClause: any = undefined;

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.trim() },
        include: { creatorProfile: true },
      });
      if (user && user.creatorProfile) {
        whereClause = { id: user.creatorProfile.id };
      }
    } else if (userId) {
      whereClause = { userId };
    }

    let profile = null;
    if (whereClause) {
      profile = await prisma.creatorProfile.findFirst({
        where: whereClause,
        include: {
          user: true,
          portfolioItems: {
            orderBy: { createdAt: "desc" },
          },
          creatorLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else {
      // No filter provided, get most recent active creator
      profile = await prisma.creatorProfile.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          portfolioItems: {
            orderBy: { createdAt: "desc" },
          },
          creatorLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    // If specific user was not found by email/userId:
    if (!profile) {
      if (email || userId) {
        // Return null profile so caller knows this user has no creator record yet
        return NextResponse.json({ success: true, profile: null });
      }
      // If no query param provided at all, fallback to most recent active creator
      profile = await prisma.creatorProfile.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          portfolioItems: {
            orderBy: { createdAt: "desc" },
          },
          creatorLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("Fetch creator profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, tagline, bio, tools, isVerified, verificationScore, displayName } = body;

    let targetProfile = null;

    if (email) {
      let user = await prisma.user.findUnique({
        where: { email: email.trim() },
        include: { creatorProfile: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.trim(),
            name: displayName || email.split("@")[0],
            role: "CREATOR",
          },
          include: { creatorProfile: true },
        });
      }

      if (user.creatorProfile) {
        targetProfile = user.creatorProfile;
      } else {
        targetProfile = await prisma.creatorProfile.create({
          data: {
            userId: user.id,
            bio: bio || "Crafting next-gen visuals with diffusion models.",
            tools: tools || ["Midjourney v6", "Runway Gen-3"],
            isVerified: isVerified ?? false,
            verificationScore: verificationScore ?? 0,
          },
        });
      }
    } else if (userId) {
      targetProfile = await prisma.creatorProfile.findFirst({
        where: { userId },
      });
    }

    if (!targetProfile) {
      targetProfile = await prisma.creatorProfile.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (targetProfile) {
      const updated = await prisma.creatorProfile.update({
        where: { id: targetProfile.id },
        data: {
          bio: bio ?? targetProfile.bio,
          tools: tools ?? targetProfile.tools,
          isVerified: isVerified ?? targetProfile.isVerified,
          verificationScore: verificationScore ?? targetProfile.verificationScore,
        },
        include: { user: true },
      });

      if (displayName && updated.userId) {
        await prisma.user.update({
          where: { id: updated.userId },
          data: { name: displayName },
        });
      }

      return NextResponse.json({ success: true, profile: updated });
    }

    return NextResponse.json({ error: "Profile could not be found or initialized" }, { status: 404 });
  } catch (error: any) {
    console.error("Update creator profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
