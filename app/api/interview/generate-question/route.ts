// app/api/interview/generate-question/route.ts
// Gemini-powered contextual question generator

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const { jobTitle, jobDescription, history, questionIndex, totalQuestions } =
    await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const isFirst = questionIndex === 0;
  const isLast  = questionIndex >= totalQuestions - 1;

  const historyText = history.length
    ? history
        .map((h: { role: string; content: string }) =>
          `${h.role === "ai" ? "Interviewer" : "Candidate"}: ${h.content}`
        )
        .join("\n")
    : "No prior conversation.";

  const prompt = isFirst
    ? `You are an AI interviewer conducting a voice interview for the role of "${jobTitle}".
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Greet the candidate warmly, briefly introduce yourself as the AI interviewer, mention the role, 
and ask your first question naturally. Keep it concise (2-3 sentences max).
Do NOT use markdown. Respond as spoken words only.`
    : isLast
    ? `You are an AI interviewer. The interview for "${jobTitle}" is concluding (question ${questionIndex + 1} of ${totalQuestions}).

Conversation so far:
${historyText}

Deliver a warm, professional closing statement. Thank the candidate, mention next steps will be shared by the hiring team. Keep it to 2-3 sentences. No markdown.`
    : `You are an AI interviewer conducting a voice interview for "${jobTitle}".
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Conversation so far:
${historyText}

You are asking question ${questionIndex + 1} of ${totalQuestions}. 
Based on the job role and conversation so far, ask ONE focused, natural follow-up interview question.
Vary the topic — cover skills, experience, problem-solving, and behavioral aspects across the interview.
Keep it to 1-2 sentences. No markdown. Spoken words only.`;

  const result = await model.generateContent(prompt);
  const question = result.response.text().trim();

  return NextResponse.json({ question });
}