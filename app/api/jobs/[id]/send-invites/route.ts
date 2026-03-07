// app/api/jobs/[id]/send-invites/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { jobs, candidates, interviewSessions } from "@/app/db/schema";
import { eq, inArray } from "drizzle-orm";

const TYPE_LABELS: Record<string,string> = {
  screening: "Screening Interview",
  tech:      "Technical Interview",
  hr_final:  "HR Final Interview",
};
const TYPE_Q: Record<string,number> = { screening:5, tech:8, hr_final:6 };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const { candidateIds, interviewType } = await req.json();

    if (!candidateIds?.length) return NextResponse.json({ error: "No candidates" }, { status: 400 });
    if (!interviewType)         return NextResponse.json({ error: "Interview type required" }, { status: 400 });

    const jobRows = await db.select().from(jobs).where(eq(jobs.id, parseInt(jobId))).limit(1);
    if (!jobRows.length) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    const job = jobRows[0];

    const cands = await db.select().from(candidates).where(inArray(candidates.id, candidateIds));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const results = [];

    for (const cand of cands) {
      try {
        const [session] = await db.insert(interviewSessions).values({
          candidateId:    cand.id,
          sessionId:      `${jobId}-${cand.id}-${Date.now()}`,
          jobId:          parseInt(jobId),
          interviewType:  interviewType,
          status:         "in_progress",
          totalQuestions: TYPE_Q[interviewType] ?? 5,
        }).returning();

        const interviewLink = `${baseUrl}/interview/${session.id}`;
        let emailSent = false;

        if (cand.email && process.env.PLUNK_API_KEY) {
          const plunkRes = await fetch("https://api.useplunk.com/v1/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.PLUNK_API_KEY}`,
            },
            body: JSON.stringify({
              to:      cand.email,
              subject: `Interview Invitation — ${job.title}`,
              body:    buildEmail({ candidateName: cand.fullName, jobTitle: job.title, department: job.department, interviewType: TYPE_LABELS[interviewType], interviewLink }),
            }),
          });
          emailSent = plunkRes.ok;
        }

        results.push({ candidateId: cand.id, interviewId: session.id, interviewLink, emailSent });
      } catch (err: any) {
        results.push({ candidateId: cand.id, interviewId: "", interviewLink: "", emailSent: false, error: err.message });
      }
    }

    const sent   = results.filter(r => r.emailSent).length;
    const failed = results.filter(r => !r.emailSent).length;
    return NextResponse.json({ results, summary: { sent, failed, total: results.length } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildEmail({ candidateName, jobTitle, department, interviewType, interviewLink }: {
  candidateName: string; jobTitle: string; department: string | null;
  interviewType: string; interviewLink: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1e3a8a,#312e81);padding:36px 40px;text-align:center;">
    <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;">🎯</div>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">You're Invited to Interview</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">${interviewType}</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="font-size:15px;color:#334155;margin:0 0 22px;line-height:1.7;">
      Hi <strong>${candidateName}</strong>,<br><br>
      We'd love to invite you to interview for <strong>${jobTitle}</strong>${department ? ` in our <strong>${department}</strong> team` : ""}.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 22px;margin-bottom:26px;">
      <p style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 5px;">POSITION</p>
      <p style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 3px;">${jobTitle}</p>
      ${department ? `<p style="font-size:13px;color:#64748b;margin:0;">${department}</p>` : ""}
    </div>
    <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
      Your interview is ready. Click the button below to begin — it's fully online and takes approximately 20–30 minutes.
    </p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${interviewLink}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
        Start Interview →
      </a>
    </div>
    <div style="background:#f1f5f9;border-radius:8px;padding:13px 15px;margin-bottom:22px;">
      <p style="font-size:10px;font-weight:600;color:#94a3b8;margin:0 0 3px;text-transform:uppercase;">Or copy this link</p>
      <p style="font-size:12px;color:#6366f1;word-break:break-all;margin:0;font-family:monospace;">${interviewLink}</p>
    </div>
    <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">Reply to this email if you have any questions. We look forward to speaking with you!</p>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
    <p style="font-size:12px;color:#94a3b8;margin:0;">Sent by the hiring team · Do not share this link</p>
  </div>
</div>
</body></html>`;
}