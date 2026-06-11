import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are a prediction market analyst. Given a YES/NO prediction market question,
you analyze available information and provide a probability estimate.
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
    const { question, category, totalYes, totalNo } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "question required" }, { status: 400 });
    }

    const totalPool = (Number(totalYes) || 0) + (Number(totalNo) || 0);
    const marketContext =
      totalPool > 0
        ? `Current market: ${((Number(totalYes) / totalPool) * 100).toFixed(1)}% YES vs ${((Number(totalNo) / totalPool) * 100).toFixed(1)}% NO (pool: ${totalPool} wei)`
        : "No bets placed yet.";

    const userMessage = `Question: "${question}"
Category: ${category || "general"}
${marketContext}

Analyze this prediction market and provide a probability estimate.`;

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
