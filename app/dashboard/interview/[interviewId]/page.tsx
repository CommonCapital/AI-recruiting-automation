// app/interview/[interviewId]/page.tsx
// Public route — accessible to anyone with the link, no authentication required

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Mic,
  Video,
  Clock,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  User,
  FileText,
  AlertCircle,
  Wifi,
  ListChecks,
} from "lucide-react";
import { InterviewHeader } from "@/components/dashboard/interview/InterviewHeader";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface InterviewDetails {
  jobTitle: string;
  company: string;
  interviewType: string;
  estimatedDuration: string;
  totalQuestions: number;
  expiresAt: string;
}

// ─── Placeholder fetcher (swap with real DB/API call) ─────────────────────────
// TODO: Replace this with: const data = await db.emailInvites.findUnique({ where: { uniqueInterviewLink: interviewId } })
function getPlaceholderDetails(_interviewId: string): InterviewDetails {
  return {
    jobTitle: "Senior Frontend Engineer",         // → from job.title
    company: "Acme Corporation",                  // → from company.name
    interviewType: "AI Voice Screening",          // → from interview.type
    estimatedDuration: "30 – 45 minutes",         // → from interview.settings.duration
    totalQuestions: 8,                            // → from interview.questions.length
    expiresAt: "December 31, 2025",               // → from emailInvite.expiresAt
  };
}

// ─── Requirement row helper ────────────────────────────────────────────────────
function Requirement({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center shrink-0 rounded-lg"
        style={{ width: 34, height: 34, background: "rgba(59,130,246,0.1)" }}
      >
        <Icon size={15} color="#3b82f6" />
      </div>
      <span style={{ fontSize: 13.5, color: "#829ab1" }}>{text}</span>
    </div>
  );
}

// ─── Guideline row helper ──────────────────────────────────────────────────────
function Guideline({ index, text }: { index: number; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex items-center justify-center shrink-0 rounded-full font-bold mt-0.5"
        style={{
          width: 20, height: 20, fontSize: 10,
          background: "rgba(59,130,246,0.15)",
          color: "#60a5fa",
        }}
      >
        {index + 1}
      </span>
      <span style={{ fontSize: 13.5, color: "#829ab1", lineHeight: 1.6 }}>{text}</span>
    </li>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InterviewJoinPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.interviewId as string;

  const details = getPlaceholderDetails(interviewId);

  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleStart() {
    if (!fullName.trim() || fullName.trim().split(" ").length < 2) {
      setNameError("Please enter your first and last name.");
      return;
    }
    setNameError("");
    setLoading(true);
    // TODO: POST to /api/interview/start with { interviewId, candidateName: fullName }
    // then redirect to the live interview room
    setTimeout(() => {
      router.push(`/dashboard/interview/${interviewId}/session?name=${encodeURIComponent(fullName.trim())}`);
    }, 1200);
  }

  const guidelines = [
    "Find a quiet, well-lit room free from distractions before starting.",
    "Ensure you have a stable internet connection throughout.",
    "Speak clearly and at a natural pace — the AI transcribes your responses in real time.",
    "Each question has a set response time. Answer as completely as you can within that window.",
    "You cannot pause or restart the interview once it has begun.",
    "Your session will be recorded for evaluation purposes.",
  ];

  return (
    <>
      <InterviewHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-20">

        {/* ── Company + role intro ────────────────────────────────────────── */}
        <div className="text-center mb-10">
          {/* Company avatar */}
          <div
            className="inline-flex items-center justify-center rounded-2xl mb-4 font-extrabold text-white"
            style={{
              width: 64, height: 64, fontSize: 20,
              background: "linear-gradient(135deg,#1e40af,#3b82f6)",
              boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
              letterSpacing: "-0.5px",
            }}
          >
            {details.company.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>

          <p style={{ fontSize: 13, color: "#4a7fa5", fontWeight: 600, margin: "0 0 6px", letterSpacing: "0.05em" }}>
            YOU&apos;VE BEEN INVITED TO INTERVIEW
          </p>
          <h1
            className="font-extrabold tracking-tight"
            style={{ fontSize: 28, color: "#f0f4f8", margin: "0 0 8px", letterSpacing: "-0.5px" }}
          >
            {details.jobTitle}
          </h1>
          <p style={{ fontSize: 15, color: "#627d98", margin: 0 }}>
            at&nbsp;<span style={{ color: "#94b4cc", fontWeight: 600 }}>{details.company}</span>
          </p>
        </div>

        {/* ── Interview details pills ────────────────────────────────────── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { icon: Briefcase,  label: "Role",      value: details.jobTitle.split(" ").slice(-2).join(" ") },
            { icon: Building2,  label: "Company",   value: details.company.split(" ")[0] },
            { icon: Mic,        label: "Format",    value: details.interviewType },
            { icon: Clock,      label: "Duration",  value: details.estimatedDuration },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center gap-2 rounded-2xl py-4 px-3"
              style={{ background: "#0d1f33", border: "1px solid #1e3a52" }}
            >
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 36, height: 36, background: "rgba(59,130,246,0.12)" }}
              >
                <Icon size={16} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: 10, color: "#4a7fa5", fontWeight: 600, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontSize: 12.5, color: "#94b4cc", fontWeight: 700, margin: "2px 0 0" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── What to expect ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: "#0d1f33", border: "1px solid #1e3a52" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <FileText size={15} color="#3b82f6" />
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#d9e2ec", margin: 0 }}>
              What to Expect
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <Requirement icon={Mic}      text={`${details.totalQuestions} AI voice questions, each with a timed response window`} />
            <Requirement icon={Video}    text="Camera is optional — microphone access is required" />
            <Requirement icon={Clock}    text={`Total estimated time: ${details.estimatedDuration}`} />
            <Requirement icon={Wifi}     text="Stable internet connection recommended throughout" />
          </div>
        </div>

        {/* ── Guidelines ─────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ background: "#0d1f33", border: "1px solid #1e3a52" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <ListChecks size={15} color="#3b82f6" />
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#d9e2ec", margin: 0 }}>
              Before You Begin
            </h2>
          </div>
          <ul className="flex flex-col gap-3 list-none m-0 p-0">
            {guidelines.map((g, i) => (
              <Guideline key={i} index={i} text={g} />
            ))}
          </ul>
        </div>

        {/* ── Candidate name + start ─────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(135deg, #0d1f33 0%, #0a1628 100%)",
            border: "1px solid #1e3a52",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}
        >
          <h2
            className="font-bold mb-1"
            style={{ fontSize: 17, color: "#f0f4f8", margin: "0 0 4px" }}
          >
            Ready to begin?
          </h2>
          <p style={{ fontSize: 13.5, color: "#627d98", margin: "0 0 24px" }}>
            Enter your full name exactly as it appears on your application.
          </p>

          {/* Name input */}
          <div className="mb-5">
            <label
              htmlFor="fullName"
              style={{ fontSize: 12, fontWeight: 600, color: "#829ab1", display: "block", marginBottom: 8, letterSpacing: "0.04em" }}
            >
              YOUR FULL NAME
            </label>
            <div className="relative">
              <div
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <User size={15} color={nameError ? "#ef4444" : "#4a7fa5"} />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Sarah Chen"
                autoComplete="name"
                style={{
                  width: "100%",
                  padding: "13px 14px 13px 40px",
                  borderRadius: 12,
                  background: "#070f1a",
                  border: nameError ? "1.5px solid #ef4444" : "1.5px solid #1e3a52",
                  color: "#f0f4f8",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  if (!nameError) e.currentTarget.style.borderColor = "#3b82f6";
                }}
                onBlur={(e) => {
                  if (!nameError) e.currentTarget.style.borderColor = "#1e3a52";
                }}
              />
            </div>
            {nameError && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle size={12} color="#ef4444" />
                <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{nameError}</p>
              </div>
            )}
          </div>

          {/* Expiry notice */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <AlertCircle size={13} color="#f59e0b" />
            <p style={{ fontSize: 12, color: "#92724a", margin: 0 }}>
              This interview link expires on <strong style={{ color: "#b8924a" }}>{details.expiresAt}</strong>. Complete it before then.
            </p>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200"
            style={{
              padding: "15px 24px",
              fontSize: 15,
              color: "#ffffff",
              background: loading
                ? "rgba(59,130,246,0.5)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 6px 24px rgba(37,99,235,0.4)",
              transform: loading ? "none" : undefined,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 30px rgba(37,99,235,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(37,99,235,0.4)";
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Preparing your interview…
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Start Interview
                <ChevronRight size={15} />
              </>
            )}
          </button>

          <p style={{ fontSize: 11.5, color: "#334e68", textAlign: "center", marginTop: 14, marginBottom: 0 }}>
            By starting, you agree that your session will be recorded and evaluated by&nbsp;
            <span style={{ color: "#3b82f6" }}>{details.company}</span>.
          </p>
        </div>

      </main>
    </>
  );
}