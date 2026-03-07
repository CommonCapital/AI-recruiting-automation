// app/api/jobs/route.ts — GET all jobs, POST create

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobs } from "@/app/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(jobs).orderBy(desc(jobs.createdAt));
    return NextResponse.json({ jobs: rows });
  } catch (err: any) {
    console.error("[GET /api/jobs]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    const [inserted] = await db.insert(jobs).values({
      title:            body.title.trim(),
      department:       body.department       || null,
      location:         body.location         || null,
      jobType:          body.jobType          ?? "full-time",
      description:      body.description      || null,
      requirements:     Array.isArray(body.requirements)     ? body.requirements     : [],
      status:           body.status           ?? "draft",
    }).returning();
    return NextResponse.json({ job: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/jobs]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}