// app/api/interview/generate-question/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_RETRIES  = 4;
const BASE_DELAY   = 2000; // 2 s → 4 s → 8 s → 16 s

// ── exponential-backoff wrapper ────────────────────────────────────────────────
async function generateWithRetry(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>,
  prompt: string,
  attempt = 0
): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err: any) {
    const status = err?.status ?? err?.httpStatusCode;

    // Retry only on 429 (rate-limit) or 503 (overloaded)
    if ((status === 429 || status === 503) && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt);
      console.warn(
        `[generate-question] Gemini ${status} — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
      );
      await new Promise((res) => setTimeout(res, delay));
      return generateWithRetry(model, prompt, attempt + 1);
    }

    throw err;
  }
}

// ── route ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { jobTitle, jobDescription, history, questionIndex, totalQuestions } =
    await req.json();

  const isFirst = questionIndex === 0;
  const isLast  = questionIndex >= totalQuestions - 1;

  const historyText =
    Array.isArray(history) && history.length
      ? history
          .map((h: { role: string; content: string }) =>
            `${h.role === "ai" ? "Interviewer" : "Candidate"}: ${h.content}`
          )
          .join("\n")
      : "No prior conversation.";

  const prompt = isFirst
    ? `You are an AI interviewer for the role of ${jobTitle}.${jobDescription ? ` Job: ${jobDescription}` : ""} Greet the candidate warmly, introduce yourself briefly, and ask your first interview question. 2 sentences max. No markdown. Spoken words only.`
    : isLast
    ? `You are an AI interviewer. The interview for ${jobTitle} is ending. Conversation: ${historyText} Deliver a warm closing, thank the candidate, mention the hiring team will follow up. 2 sentences. No markdown. Spoken words only.`
    : `You are an AI interviewer for ${jobTitle}.${jobDescription ? ` Job: ${jobDescription}` : ""} Conversation so far:\n${historyText}\nAsk question ${questionIndex + 1} of ${totalQuestions}. Pick a fresh topic — rotate between technical skills, experience, problem-solving, and behavioral. 1-2 sentences. No markdown. Spoken words only.`;

  try {
    const genAI  = new GoogleGenerativeAI(apiKey);
    const model  = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const question = await generateWithRetry(model, prompt);
    return NextResponse.json({ question });
  } catch (err: any) {
    const status = err?.status ?? err?.httpStatusCode ?? 500;
    console.error("[generate-question] Final error:", { status, message: err?.message });

    // Return a safe fallback question so the interview doesn't crash
    const fallback = questionIndex === 0
      ? "Hello! Welcome to your interview. Could you start by telling me a bit about yourself and your background?"
      : isLast
      ? "Thank you so much for your time today. We really appreciate your responses and the hiring team will be in touch soon."
      : "That's really interesting. Could you tell me about a challenging project you've worked on recently and how you overcame any obstacles?";

    // On rate-limit, return fallback with 200 so interview continues
    if (status === 429) {
      console.warn("[generate-question] Rate limited — using fallback question");
      return NextResponse.json({ question: fallback, rateLimited: true });
    }

    return NextResponse.json({ error: err?.message ?? "Gemini request failed" }, { status: 500 });
  }
}