// app/api/interview/complete/route.ts
// Called at end of interview: saves transcript → generates Gemini summary → saves summary

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/app/db";
import { interviewSessions, TranscriptMessage, InterviewSummary } from "@/app/db/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ─── Summary generation ────────────────────────────────────────────────────────
async function generateSummary(
  jobTitle: string,
  jobDescription: string,
  candidateName: string,
  transcript: TranscriptMessage[]
): Promise<InterviewSummary> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const transcriptText = transcript
    .map((m) => `${m.role === "ai" ? "Interviewer" : candidateName}: ${m.content}`)
    .join("\n\n");

  const prompt = `You are an expert technical recruiter. Analyze this AI interview transcript for a "${jobTitle}" position and produce a structured evaluation.

Job Description: ${jobDescription || "Not provided"}

Interview Transcript:
${transcriptText}

Respond ONLY with a valid JSON object (no markdown, no backticks) with exactly this structure:
{
  "overallScore": <integer 0-100>,
  "recommendation": <one of: "strong_yes" | "yes" | "maybe" | "no" | "strong_no">,
  "recommendationLabel": <human-readable string e.g. "Strong Hire">,
  "headline": <one compelling sentence summarizing the candidate>,
  "strengths": [<3-5 specific strength strings>],
  "weaknesses": [<2-4 specific weakness strings, or empty array if none>],
  "skillScores": [
    { "skill": "Communication",        "score": <1-10>, "rationale": "<1 sentence>" },
    { "skill": "Technical Knowledge",  "score": <1-10>, "rationale": "<1 sentence>" },
    { "skill": "Problem Solving",      "score": <1-10>, "rationale": "<1 sentence>" },
    { "skill": "Culture Fit",          "score": <1-10>, "rationale": "<1 sentence>" },
    { "skill": "Experience Depth",     "score": <1-10>, "rationale": "<1 sentence>" }
  ],
  "recruiterNotes": "<2-3 paragraph narrative for the hiring team>",
  "redFlags": [<any concerns as strings, or empty array>],
  "generatedAt": "${new Date().toISOString()}"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip any accidental markdown fences
  const clean = raw.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(clean) as InterviewSummary;
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      sessionId,        // existing DB row to update (if pre-created on session start)
      interviewId,      // URL param
      candidateName,
      candidateEmail,
      jobTitle,
      jobDescription,
      transcript,       // TranscriptMessage[]
      durationSeconds,
      questionsAnswered,
      totalQuestions,
    } = await req.json();

    if (!interviewId || !candidateName || !transcript?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Generate AI summary via Gemini
    const summary = await generateSummary(
      jobTitle ?? "Unknown Role",
      jobDescription ?? "",
      candidateName,
      transcript
    );

    // 2. Upsert session record in DB
    //    If sessionId provided → update; otherwise insert new row
    let savedSessionId = sessionId;

    if (sessionId) {
      await db
        .update(interviewSessions)
        .set({
          status: "completed",
          transcript,
          summary,
          durationSeconds,
          questionsAnswered,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(interviewSessions.id, sessionId));
    } else {
      const [inserted] = await db
        .insert(interviewSessions)
        .values({
          interviewId,
          candidateName,
          candidateEmail: candidateEmail ?? null,
          jobTitle: jobTitle ?? "Unknown Role",
          jobDescription: jobDescription ?? null,
          status: "completed",
          transcript,
          summary,
          durationSeconds,
          questionsAnswered: questionsAnswered ?? transcript.filter((m: TranscriptMessage) => m.role === "user").length,
          totalQuestions: totalQuestions ?? 7,
          completedAt: new Date(),
        })
        .returning({ id: interviewSessions.id });

      savedSessionId = inserted.id;
    }

    return NextResponse.json({
      success: true,
      sessionId: savedSessionId,
      summary,
    });
  } catch (err: any) {
    console.error("[interview/complete]", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}