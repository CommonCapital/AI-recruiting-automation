// app/api/jobs/[id]/route.ts — PATCH status/fields, DELETE

import { NextRequest, NextResponse } from "next/server";
import { db  } from "@/app/db";
import { jobs } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { id: _id, createdAt: _ca, ...rest } = body;
    const [updated] = await db.update(jobs)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(jobs.id, parseInt(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ job: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.delete(jobs).where(eq(jobs.id, parseInt(id))).returning({ id: jobs.id });
    if (!deleted.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}