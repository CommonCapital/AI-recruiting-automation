// app/api/candidates/route.ts  — GET all candidates, POST create new

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { candidates, NewCandidate } from "@/app/db/schema";
import { desc, ilike, or } from "drizzle-orm";

// GET /api/candidates?search=xxx
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search")?.trim();

    const rows = await db
      .select()
      .from(candidates)
      .where(
        search
          ? or(
              ilike(candidates.fullName, `%${search}%`),
              ilike(candidates.email, `%${search}%`),
            )
          : undefined
      )
      .orderBy(desc(candidates.createdAt));

    return NextResponse.json({ candidates: rows });
  } catch (err: any) {
    console.error("[GET /api/candidates]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/candidates — create a new candidate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<NewCandidate>;

    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const [inserted] = await db
  .insert(candidates)
  .values({
    fullName: body.fullName!.trim(),
    email: body.email || "",
    phone: body.phone || null,
    location: body.location || null,
    linkedinUrl: body.linkedinUrl || null,
    portfolioUrl: body.portfolioUrl || null,
    jobTitle: body.jobTitle || null,
    currentCompany: body.currentCompany || null,
    experienceYears: body.experienceYears ? Number(body.experienceYears) : null,
    skills: Array.isArray(body.skills)
  ? (body.skills as string[])
  : typeof body.skills === "string"
  ? (body.skills as string).split(",").map((s: string) => s.trim()).filter(Boolean)
  : [],
    education: body.education || null,
    summary: body.summary || null,
    notes: body.notes || null,
    resumeFileName: body.resumeFileName || null,
    status: "new",
    updatedAt: new Date(),
  })
  .returning();

    return NextResponse.json({ candidate: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/candidates]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
