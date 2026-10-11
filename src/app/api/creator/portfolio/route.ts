import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get("creatorId");

    const items = await prisma.portfolioItem.findMany({
      where: creatorId ? { creatorId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Fetch portfolio error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, mediaUrl, contentType, toolsUsed, workflow, creatorId, userEmail, email } = body;

    if (!title || !mediaUrl) {
      return NextResponse.json(
        { error: "Title and Media URL are required" },
        { status: 400 }
      );
    }

    // Find target creator via email or creatorId
    let targetCreatorId = creatorId;
    const lookupEmail = email || userEmail;

    if (lookupEmail) {
      const user = await prisma.user.findUnique({
        where: { email: lookupEmail.trim() },
        include: { creatorProfile: true },
      });
      if (user && user.creatorProfile) {
        targetCreatorId = user.creatorProfile.id;
      }
    }

    if (!targetCreatorId) {
      const firstCreator = await prisma.creatorProfile.findFirst();
      if (firstCreator) {
        targetCreatorId = firstCreator.id;
      }
    }

    if (!targetCreatorId) {
      // Create fallback creator profile if none exists
      const dummyUser = await prisma.user.create({
        data: {
          email: `creator_${Date.now()}@genworks.ai`,
          name: "GenWorks AI Creator",
          role: "CREATOR",
        },
      });

      const newCreator = await prisma.creatorProfile.create({
        data: {
          userId: dummyUser.id,
          tools: toolsUsed || ["Midjourney v6", "Runway Gen-3"],
          isVerified: true,
          verificationScore: 90,
        },
      });
      targetCreatorId = newCreator.id;
    }

    const newItem = await prisma.portfolioItem.create({
      data: {
        creatorId: targetCreatorId,
        title,
        mediaUrl,
        contentType: contentType || "Video",
        toolsUsed: Array.isArray(toolsUsed) ? toolsUsed : [toolsUsed || "Runway Gen-3"],
        workflow: workflow || "",
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("Create portfolio item error:", error);
    return NextResponse.json({ error: error.message || "Failed to create portfolio item" }, { status: 500 });
  }
}
