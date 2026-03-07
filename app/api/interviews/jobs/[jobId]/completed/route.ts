// app/api/interviews/jobs/[jobId]/completed/route.ts
// GET: Fetch candidates who have completed interviews for a specific job

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { interviews, candidates, jobs, interviewSummaries } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Get all completed interviews for this job with their summaries
    const completedCandidates = await db
      .select({
        sessionId: interviews.sessionId,
        candidateName: candidates.fullName,
        candidateEmail: candidates.email,
        jobTitle: jobs.title,
        status: interviews.status,
        durationSeconds: interviews.durationSeconds,
        questionsAnswered: interviews.questionsAnswered,
        totalQuestions: interviews.totalQuestions,
        completedAt: interviews.completedAt,
        createdAt: interviews.createdAt,
        summary: interviewSummaries,
      })
      .from(interviews)
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobs, eq(interviews.jobId, jobs.id))
      .leftJoin(interviewSummaries, eq(interviews.id, interviewSummaries.interviewId))
      .where(eq(interviews.jobId, parseInt(jobId)))
      .orderBy(interviews.completedAt || interviews.updatedAt);

    // Filter to only completed sessions
    const completedSessions = completedCandidates.filter(s => s.status === "completed");

    return NextResponse.json({ 
      success: true, 
      completed: completedSessions,
      total: completedSessions.length 
    });
  } catch (err: any) {
    console.error("[interviews/jobs/completed]", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch completed interviews" },
      { status: 500 }
    );
  }
}