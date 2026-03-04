// app/(dashboard)/dashboard/candidates/[id]/page.tsx
// Shows candidate's interview session results to the recruiter

import { notFound } from "next/navigation";
import { db } from "@/app/db";
import { interviewSessions, InterviewSummary } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import {
  ThumbsUp, ThumbsDown, Minus, Star, BarChart2,
  FileText, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, MessageSquare, User, Briefcase,
} from "lucide-react";

interface Props { params: { id: string } }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const RECO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  strong_yes: { label: "Strong Hire",  color: "#10b981", bg: "#d1fae5", border: "#6ee7b7", icon: ThumbsUp },
  yes:        { label: "Hire",         color: "#3b82f6", bg: "#dbeafe", border: "#93c5fd", icon: ThumbsUp },
  maybe:      { label: "Consider",     color: "#d97706", bg: "#fef3c7", border: "#fcd34d", icon: Minus },
  no:         { label: "Pass",         color: "#ef4444", bg: "#fee2e2", border: "#fca5a5", icon: ThumbsDown },
  strong_no:  { label: "Strong Pass",  color: "#dc2626", bg: "#fee2e2", border: "#f87171", icon: ThumbsDown },
};

// ─── Score ring (light theme) ─────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 40, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 104, height: 104 }}>
      <svg width="104" height="104" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="52" cy="52" r={r} fill="none" stroke="#d9e2ec" strokeWidth="8" />
        <circle cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span style={{ fontSize: 24, fontWeight: 800, color: "#0a1f33", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: "#829ab1", fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

// ─── Skill bar (light theme) ──────────────────────────────────────────────────
function SkillBar({ skill, score, rationale }: { skill: string; score: number; rationale: string }) {
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#3b82f6" : "#f59e0b";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, fontWeight: 600, color: "#334e68" }}>{skill}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}<span style={{ fontSize: 10, color: "#829ab1" }}>/10</span></span>
      </div>
      <div style={{ height: 6, background: "#d9e2ec", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score * 10}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 11.5, color: "#829ab1", margin: 0, lineHeight: 1.5 }}>{rationale}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CandidateDetailPage({ params }: Props) {
  const session = await db.query.interviewSessions.findFirst({
    where: eq(interviewSessions.id, params.id),
  });

  if (!session) notFound();

  const summary = session.summary as InterviewSummary | null;
  const reco    = summary ? (RECO_CONFIG[summary.recommendation] ?? RECO_CONFIG.maybe) : null;
  const RecoIcon = reco?.icon;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-2 mb-1" style={{ fontSize: 12, color: "#829ab1" }}>
          <span>Candidates</span>
          <span>/</span>
          <span style={{ color: "#334e68" }}>{session.candidateName}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a1f33", margin: 0 }}>
          {session.candidateName}
        </h1>
      </div>

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {[
          { icon: Briefcase, text: session.jobTitle },
          { icon: User,      text: session.candidateName },
          { icon: Clock,     text: session.durationSeconds ? formatTime(session.durationSeconds) : "—" },
          { icon: MessageSquare, text: `${session.questionsAnswered}/${session.totalQuestions} questions answered` },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "#f0f4f8", border: "1px solid #d9e2ec", fontSize: 12, color: "#486581" }}>
            <Icon size={12} color="#829ab1" />
            {text}
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: "#d1fae5", border: "1px solid #6ee7b7", fontSize: 12, color: "#065f46" }}>
          <CheckCircle2 size={12} color="#10b981" />
          {session.status === "completed" ? "Completed" : session.status}
        </div>
      </div>

      {!summary ? (
        <div className="flex items-center justify-center rounded-2xl p-12"
          style={{ background: "#f0f4f8", border: "1px dashed #d9e2ec" }}>
          <p style={{ color: "#829ab1", fontSize: 14 }}>No summary generated yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Score + recommendation */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="flex flex-col items-center gap-4 rounded-2xl p-6"
              style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
              <div className="flex items-center gap-2">
                <Star size={13} color="#f59e0b" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em" }}>OVERALL SCORE</span>
              </div>
              <ScoreRing score={summary.overallScore} />
              <p style={{ fontSize: 13, color: "#627d98", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
                {summary.headline}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl p-6"
              style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={13} color="#3b82f6" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em" }}>RECOMMENDATION</span>
              </div>
              <div className="flex items-center justify-center rounded-full"
                style={{ width: 60, height: 60, background: reco!.bg, border: `2px solid ${reco!.border}` }}>
                <RecoIcon size={24} color={reco!.color} />
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: reco!.color }}>{reco!.label}</span>
            </div>
          </div>

          {/* Skill breakdown */}
          <div className="rounded-2xl p-6"
            style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={14} color="#3b82f6" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#102a43", margin: 0 }}>Skill Breakdown</h2>
            </div>
            <div className="flex flex-col gap-5">
              {summary.skillScores.map((s) => <SkillBar key={s.skill} {...s} />)}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp size={13} color="#10b981" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", letterSpacing: "0.06em" }}>STRENGTHS</span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {summary.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "#10b981", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#486581", lineHeight: 1.5 }}>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-5"
              style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={13} color="#f59e0b" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", letterSpacing: "0.06em" }}>AREAS TO IMPROVE</span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
                {summary.weaknesses.length > 0
                  ? summary.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: "#f59e0b", flexShrink: 0 }}>△</span>
                      <span style={{ fontSize: 13, color: "#486581", lineHeight: 1.5 }}>{w}</span>
                    </li>
                  ))
                  : <li style={{ fontSize: 13, color: "#829ab1" }}>No significant weaknesses noted.</li>}
              </ul>
            </div>
          </div>

          {/* Red flags */}
          {summary.redFlags.length > 0 && (
            <div className="rounded-2xl p-5"
              style={{ background: "#fff5f5", border: "1px solid #fecaca", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em" }}>RED FLAGS</span>
              </div>
              <ul className="list-none m-0 p-0 flex flex-col gap-2">
                {summary.redFlags.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "#ef4444", flexShrink: 0 }}>⚠</span>
                    <span style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recruiter notes */}
          <div className="rounded-2xl p-6"
            style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={14} color="#3b82f6" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#102a43", margin: 0 }}>Recruiter Notes</h2>
              </div>
              <span style={{ fontSize: 10, color: "#bcccdc" }}>AI-generated via Gemini</span>
            </div>
            <p style={{ fontSize: 14, color: "#486581", lineHeight: 1.9, margin: 0, whiteSpace: "pre-line" }}>
              {summary.recruiterNotes}
            </p>
          </div>

          {/* Full transcript */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #d9e2ec", boxShadow: "0 2px 12px rgba(10,31,51,0.05)" }}>
            <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid #f0f4f8" }}>
              <MessageSquare size={14} color="#3b82f6" />
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#102a43", margin: 0 }}>Full Transcript</h2>
              <span className="ml-auto" style={{ fontSize: 11, color: "#bcccdc" }}>
                {session.transcript.length} messages
              </span>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: "#f0f4f8", maxHeight: 480, overflowY: "auto" }}>
              {(session.transcript as any[]).map((msg, i) => (
                <div key={i} className="flex gap-3 px-6 py-4">
                  <div className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 28, height: 28, marginTop: 2,
                      background: msg.role === "ai" ? "rgba(99,102,241,0.1)" : "#f0f4f8" }}>
                    {msg.role === "ai"
                      ? <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>AI</span>
                      : <User size={12} color="#829ab1" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: msg.role === "ai" ? "#6366f1" : "#829ab1", margin: "0 0 3px" }}>
                      {msg.role === "ai" ? "AI Interviewer" : session.candidateName}
                      <span style={{ color: "#bcccdc", fontWeight: 400, marginLeft: 8 }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </p>
                    <p style={{ fontSize: 13.5, color: "#334e68", margin: 0, lineHeight: 1.6 }}>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer timestamp */}
          <p style={{ fontSize: 11, color: "#bcccdc", textAlign: "center" }}>
            Summary generated at {summary.generatedAt ? new Date(summary.generatedAt).toLocaleString() : "—"}
          </p>
        </div>
      )}
    </div>
  );
}