import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { briefTitle, briefDescription, targetCategory, requiredTools, budget } = await req.json();

    // Fetch verified or existing creators from DB (with fallback candidates)
    let dbCreators: any[] = [];
    try {
      dbCreators = await prisma.creatorProfile.findMany({
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          portfolioItems: {
            take: 3,
          },
        },
      });
    } catch (e) {
      console.warn("DB query fallback in ai-match:", e);
    }

    // Default elite creators pool if DB is fresh
    const candidates = dbCreators.length > 0 ? dbCreators.map(c => ({
      id: c.id,
      name: c.user?.name || "AI Director",
      tagline: c.tagline || "Generative AI Specialist",
      tools: c.tools || ["Runway Gen-3", "Midjourney v6"],
      score: c.verificationScore || 92,
      isVerified: c.isVerified,
    })) : [
      {
        id: "c1",
        name: "Arjun Verma",
        tagline: "Commercial Video Director & Cinematic Storyteller",
        tools: ["Runway Gen-3", "Midjourney v6", "Kling 1.5", "Premiere AI"],
        score: 98,
        isVerified: true,
      },
      {
        id: "c2",
        name: "Elena Rostova",
        tagline: "High-Fashion Lookbook & Photorealistic Portrait Artist",
        tools: ["Flux.1", "Midjourney v6", "Luma Dream Machine"],
        score: 95,
        isVerified: true,
      },
      {
        id: "c3",
        name: "Kavya Patel",
        tagline: "3D Product CGI & Spatial Environments Specialist",
        tools: ["Sora", "Blender AI", "Runway Gen-3", "Spline"],
        score: 94,
        isVerified: true,
      },
      {
        id: "c4",
        name: "David Chen",
        tagline: "Viral Short-Form VFX & Motion Design",
        tools: ["Kling 1.5", "Pika 2.0", "After Effects AI"],
        score: 91,
        isVerified: true,
      },
    ];

    const prompt = `You are the Lead Creative Talent Matchmaker for GenWorks (Enterprise AI Creator Platform).
A brand submitted this creative brief:
- Title: ${briefTitle || "AI Commercial Campaign"}
- Description: ${briefDescription || "High-end generative AI video campaign"}
- Category: ${targetCategory || "Commercial Video"}
- Tools Desired: ${Array.isArray(requiredTools) ? requiredTools.join(", ") : (requiredTools || "Any")}
- Budget: ${budget || "Competitive"}

Evaluate these Creator Candidates:
${JSON.stringify(candidates, null, 2)}

Select the Top 3 best matching creators. For each, give:
1. creatorId
2. matchPercentage (number between 85 and 99)
3. aiReasoning (1-2 crisp professional sentences on why their technical toolset fits the brand brief)
4. suggestedDeliverables (e.g., "30s 4K 16:9 Hero Video + 3 Cutdowns")

Return response in strict JSON format:
{
  "matches": [
    {
      "creatorId": "string",
      "matchPercentage": 96,
      "aiReasoning": "string",
      "suggestedDeliverables": "string"
    }
  ],
  "campaignInsight": "Short 1-sentence tip on how the brand can optimize this brief for generative AI models."
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    let parsedResult = {
      matches: candidates.slice(0, 3).map((c, i) => ({
        creatorId: c.id,
        matchPercentage: 96 - (i * 3),
        aiReasoning: `Strong alignment with ${c.tools.slice(0, 2).join(" and ")} generative pipelines.`,
        suggestedDeliverables: "4K Master Video + Storyboard Prompts",
      })),
      campaignInsight: "Use precise seed tokens and negative prompting to maintain brand consistency across scenes.",
    };

    if (jsonMatch) {
      try {
        parsedResult = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn("JSON parse fallback in match result:", e);
      }
    }

    // Merge candidate details into matches
    const enrichedMatches = parsedResult.matches.map((m: any) => {
      const candidate = candidates.find((c) => c.id === m.creatorId) || candidates[0];
      return {
        ...m,
        creator: candidate,
      };
    });

    return NextResponse.json({
      success: true,
      matches: enrichedMatches,
      campaignInsight: parsedResult.campaignInsight,
    });
  } catch (error: any) {
    console.error("AI Match Error:", error);
    return NextResponse.json(
      { error: "AI Matchmaker temporarily unavailable", details: error.message },
      { status: 500 }
    );
  }
}
