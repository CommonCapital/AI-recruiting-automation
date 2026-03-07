// app/api/candidates/[id]/route.ts — GET one, PATCH, DELETE

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { candidates } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// GET /api/candidates/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, parseInt(id)))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate: rows[0] });
  } catch (err: any) {
    console.error("[GET /api/candidates/:id]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/candidates/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { id: _id, createdAt: _ca, ...rest } = body;

    const [updated] = await db
      .update(candidates)
      .set({ ...rest, updatedAt: new Date() })
      .where(eq(candidates.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate: updated });
  } catch (err: any) {
    console.error("[PATCH /api/candidates/:id]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/candidates/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db
      .delete(candidates)
      .where(eq(candidates.id, parseInt(id)))
      .returning({ id: candidates.id });

    if (!deleted.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/candidates/:id]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
