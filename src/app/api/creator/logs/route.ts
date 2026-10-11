import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const logs = await prisma.creatorLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Fetch logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, mediaUrl, creatorId, userEmail } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    let targetCreatorId = creatorId;

    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail.trim() },
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
      return NextResponse.json({ error: "No creator profile found" }, { status: 400 });
    }

    const log = await prisma.creatorLog.create({
      data: {
        creatorId: targetCreatorId,
        content,
        mediaUrl: mediaUrl || null,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("Create log error:", error);
    return NextResponse.json({ error: error.message || "Failed to create log" }, { status: 500 });
  }
}
