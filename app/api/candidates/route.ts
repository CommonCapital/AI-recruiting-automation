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
              ilike(candidates.email,    `%${search}%`),
              ilike(candidates.jobTitle, `%${search}%`),
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
      return NextResponse.json({ error: "fullName is required" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(candidates)
      .values({
        ...body,
        fullName: body.fullName.trim(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ candidate: inserted }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/candidates]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}