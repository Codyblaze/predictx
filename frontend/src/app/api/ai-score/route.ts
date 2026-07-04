import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a prediction market analyst. Given a YES/NO prediction market question,
you provide an independent probability estimate based on real-world information only.
Do not assume or mirror any betting market odds — you have no knowledge of current wagers.
Always respond with ONLY valid JSON in this exact format:
{
  "yesProbability": <number 0-100>,
  "noProbability": <number 0-100>,
  "summary": "<2 sentence analysis>",
  "confidence": "<high|medium|low>"
}
yesProbability + noProbability must equal 100.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { question, category } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }

    const userMessage = `Question: "${question}"
Category: ${category || "general"}

Provide an independent probability estimate for this prediction market.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 256,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw);

    if (
      typeof parsed.yesProbability !== "number" ||
      typeof parsed.noProbability !== "number"
    ) {
      throw new Error("Invalid AI response shape");
    }

    return NextResponse.json(parsed, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("[ai-score]", err);
    return NextResponse.json(
      { error: "Failed to fetch AI score" },
      { status: 500 }
    );
  }
}
