/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { answers, skills } = await req.json();

    const prompt = `You are an expert AI recruiter evaluating a creator's skills: ${skills.join(', ')}.
    They provided these answers to technical questions:
    ${JSON.stringify(answers)}
    
    Evaluate their actual knowledge. Return a JSON object EXACTLY like this:
    { "score": 85, "badge": "Expert", "feedback": "Strong understanding of diffusion models." }`;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, badge: 'Unverified', feedback: 'Failed to parse AI response' };

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'AI Verification Failed' }, { status: 500 });
  }
}
