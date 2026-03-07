// app/api/interviews/jobs/[jobId]/invited/route.ts
// GET: Fetch candidates who have been sent interview invites for a specific job

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { interviews, candidates, jobs } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    // Get all interviews for this job that are invited or in_progress
    const invitedCandidates = await db
      .select({
        sessionId: interviews.sessionId,
        candidateName: candidates.fullName,
        candidateEmail: candidates.email,
        jobTitle: jobs.title,
        status: interviews.status,
        startedAt: interviews.createdAt,
        createdAt: interviews.createdAt,
      })
      .from(interviews)
      .leftJoin(candidates, eq(interviews.candidateId, candidates.id))
      .leftJoin(jobs, eq(interviews.jobId, jobs.id))
      .where(eq(interviews.jobId, parseInt(jobId)))
      .orderBy(interviews.createdAt);

    // Filter to show only invited/in_progress candidates (not completed)
    const invitedSessions = invitedCandidates.filter(s => s.status !== "completed");

    return NextResponse.json({ 
      success: true, 
      invited: invitedSessions,
      total: invitedSessions.length 
    });
  } catch (err: any) {
    console.error("[interviews/jobs/invited]", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch invited candidates" },
      { status: 500 }
    );
  }
}