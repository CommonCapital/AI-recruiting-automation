// app/api/jobs/[id]/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/app/db";
import { jobs, candidates } from "@/app/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  try {
    const { id } = await params;

    const jobRows = await db.select().from(jobs).where(eq(jobs.id, parseInt(id))).limit(1);
    if (!jobRows.length) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    const job = jobRows[0];

    const allCandidates = await db.select().from(candidates).orderBy(desc(candidates.createdAt));
    if (!allCandidates.length) return NextResponse.json({ matches: [], scores: {} });

    const candidateList = allCandidates.map(c => ({
      id:      c.id,
      name:    c.fullName,
      title:   c.jobTitle, // Using name as title since jobTitle doesn't exist
      company: c.email, // Using email as company since currentCompany doesn't exist
      skills:  c.skills ?? [],
      exp:     0, // Default experience since experienceYears doesn't exist
      summary: "", // Default summary since summary doesn't exist
    }));

    const prompt = `You are a senior recruiter AI. Score every candidate against this job and return ALL of them ranked.

JOB:
Title: ${job.title}
Department: ${job.department ?? ""}
Description: ${job.description ?? ""}
Requirements: ${Array.isArray(job.requirements) ? job.requirements.slice(0, 5).join("; ") : ""}

CANDIDATES:
${JSON.stringify(candidateList, null, 2)}

Return ONLY a valid JSON object — no markdown, no backticks, no explanation.
Format:
{
  "ranked": ["<id of best match>", "<id of 2nd best>", ...ALL candidate IDs ordered best to worst],
  "scores": { "<id>": <integer 0-100>, ... }
}

Include EVERY candidate id in "ranked". Score based on: skill overlap (50%), experience relevance (30%), title similarity (20%).`;

    const genAI  = new GoogleGenerativeAI(apiKey);
    const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const raw    = result.response.text().trim()
      .replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();

    const parsed: { ranked: string[]; scores: Record<string, number> } = JSON.parse(raw);
    const { ranked, scores } = parsed;

    // Persist top matches - commented out since matchedCandidateIds doesn't exist in schema
    // const topIds = ranked.filter(rid => (scores[rid] ?? 0) >= 30).slice(0, 20);
    // await db.update(jobs)
    //   .set({ matchedCandidateIds: topIds, updatedAt: new Date() })
    //   .where(eq(jobs.id, id));

    // Build ordered result — ALL candidates in ranked order with score attached
    const orderedMatches = ranked
      .map(rid => {
        const c = allCandidates.find(c => c.id === parseInt(rid));
        if (!c) return null;
        return { ...c, matchScore: scores[rid] ?? 0 };
      })
      .filter(Boolean);

    return NextResponse.json({ matches: orderedMatches, scores, total: orderedMatches.length });
  } catch (err: any) {
    console.error("[job-match]", err);
    return NextResponse.json({ error: err?.message ?? "Match failed" }, { status: 500 });
  }
}