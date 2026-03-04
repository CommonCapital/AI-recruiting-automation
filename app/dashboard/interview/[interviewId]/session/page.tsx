// app/interview/[interviewId]/session/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Zap, Bot, Clock, MessageSquare,
  CheckCircle2, TrendingUp, AlertTriangle,
  ThumbsUp, ThumbsDown, Minus, Star,
  BarChart2, FileText,
} from "lucide-react";
import { useInterviewSession, Message, InterviewPhase } from "@/hooks/useInterviewSession";
import { InterviewSummary } from "@/app/db/schema";

// ── utils ──────────────────────────────────────────────────────────────────────
function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
function phaseLabel(p: InterviewPhase) {
  return ({ "ai-thinking": "Thinking…", "ai-speaking": "Speaking", "user-speaking": "Listening…", "processing": "Processing…", "saving": "Saving…", "ended": "Complete" } as any)[p] ?? "Ready";
}

const RECO: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  strong_yes: { label: "Strong Hire", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: ThumbsUp },
  yes:        { label: "Hire",        color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: ThumbsUp },
  maybe:      { label: "Consider",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: Minus    },
  no:         { label: "Pass",        color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: ThumbsDown },
  strong_no:  { label: "Strong Pass", color: "#dc2626", bg: "rgba(220,38,38,0.12)",   icon: ThumbsDown },
};

// ── sub-components (summary, avatar, webcam, chat, controls) ──────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 44, c = 2 * Math.PI * r, fill = (score / 100) * c;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e3a52" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${fill} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#f0f4f8", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: "#4a7fa5" }}>/100</span>
      </div>
    </div>
  );
}

function SkillBar({ skill, score, rationale }: { skill: string; score: number; rationale: string }) {
  const color = score >= 7 ? "#10b981" : score >= 5 ? "#3b82f6" : "#f59e0b";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#d9e2ec" }}>{skill}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}<span style={{ fontSize: 10, color: "#4a7fa5" }}>/10</span></span>
      </div>
      <div style={{ height: 6, background: "#1e3a52", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${score * 10}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 11.5, color: "#627d98", margin: 0, lineHeight: 1.5 }}>{rationale}</p>
    </div>
  );
}

function SummaryScreen({ summary, candidateName, elapsedSeconds }: { summary: InterviewSummary; candidateName: string; elapsedSeconds: number }) {
  const reco = RECO[summary.recommendation] ?? RECO.maybe;
  const RecoIcon = reco.icon;
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={30} color="#10b981" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f0f4f8", margin: "0 0 8px" }}>Interview Complete</h1>
        <p style={{ fontSize: 14, color: "#627d98", margin: 0 }}>
          Thank you, <strong style={{ color: "#94b4cc" }}>{candidateName}</strong>. Your responses have been recorded.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, borderRadius: 18, padding: 24, background: "#0d1f33", border: "1px solid #1e3a52" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Star size={13} color="#f59e0b" /><span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em" }}>OVERALL SCORE</span></div>
          <ScoreRing score={summary.overallScore} />
          <p style={{ fontSize: 13, color: "#627d98", margin: 0, textAlign: "center", lineHeight: 1.5 }}>{summary.headline}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, borderRadius: 18, padding: 24, background: "#0d1f33", border: "1px solid #1e3a52" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={13} color="#3b82f6" /><span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em" }}>RECOMMENDATION</span></div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: reco.bg, border: `2px solid ${reco.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}><RecoIcon size={26} color={reco.color} /></div>
          <span style={{ fontSize: 20, fontWeight: 800, color: reco.color }}>{reco.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid #1e3a52", width: "100%", justifyContent: "center" }}>
            <Clock size={11} color="#4a7fa5" /><span style={{ fontSize: 12, color: "#4a7fa5" }}>Duration: {fmt(elapsedSeconds)}</span>
          </div>
        </div>
      </div>
      <div style={{ borderRadius: 18, padding: 24, background: "#0d1f33", border: "1px solid #1e3a52", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}><BarChart2 size={14} color="#3b82f6" /><span style={{ fontSize: 13, fontWeight: 700, color: "#d9e2ec" }}>Skill Breakdown</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {summary.skillScores.map((s) => <SkillBar key={s.skill} {...s} />)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ borderRadius: 18, padding: 20, background: "#0d1f33", border: "1px solid #1e3a52" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}><ThumbsUp size={13} color="#10b981" /><span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", letterSpacing: "0.06em" }}>STRENGTHS</span></div>
          {summary.strengths.map((s, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}><span style={{ color: "#10b981", flexShrink: 0 }}>✓</span><span style={{ fontSize: 13, color: "#94b4cc", lineHeight: 1.5 }}>{s}</span></div>)}
        </div>
        <div style={{ borderRadius: 18, padding: 20, background: "#0d1f33", border: "1px solid #1e3a52" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}><AlertTriangle size={13} color="#f59e0b" /><span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em" }}>AREAS TO IMPROVE</span></div>
          {summary.weaknesses.length > 0
            ? summary.weaknesses.map((w, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}><span style={{ color: "#f59e0b", flexShrink: 0 }}>△</span><span style={{ fontSize: 13, color: "#94b4cc", lineHeight: 1.5 }}>{w}</span></div>)
            : <p style={{ fontSize: 13, color: "#627d98" }}>No significant weaknesses noted.</p>}
        </div>
      </div>
      {summary.redFlags.length > 0 && (
        <div style={{ borderRadius: 18, padding: 20, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}><AlertTriangle size={13} color="#ef4444" /><span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: "0.06em" }}>RED FLAGS</span></div>
          {summary.redFlags.map((f, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}><span style={{ color: "#ef4444" }}>⚠</span><span style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{f}</span></div>)}
        </div>
      )}
      <div style={{ borderRadius: 18, padding: 24, background: "#0d1f33", border: "1px solid #1e3a52", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><FileText size={13} color="#3b82f6" /><span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em" }}>RECRUITER NOTES</span><span style={{ marginLeft: "auto", fontSize: 10, color: "#1e3a52" }}>AI-generated · Hiring team only</span></div>
        <p style={{ fontSize: 13.5, color: "#829ab1", lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>{summary.recruiterNotes}</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <a href="/" style={{ display: "inline-block", padding: "12px 32px", borderRadius: 12, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>Done — Close Window</a>
      </div>
    </div>
  );
}

function AIAgentAvatar({ speaking }: { speaking: boolean }) {
  return (
    <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {speaking && [1,2,3].map(i => (
        <span key={i} style={{ position: "absolute", borderRadius: "50%", border: "2px solid #60a5fa", width: 72 + i * 18, height: 72 + i * 18, opacity: 0, animation: `ping 1.6s ease-out ${i * 0.35}s infinite` }} />
      ))}
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: speaking ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "linear-gradient(135deg,#1e3a5f,#1e3a5f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: speaking ? "0 0 24px rgba(99,102,241,0.5)" : "none", transition: "all 0.4s", position: "relative", zIndex: 1 }}>
        <Bot size={26} color={speaking ? "#fff" : "#4a7fa5"} strokeWidth={1.5} />
      </div>
      {speaking && (
        <div style={{ position: "absolute", bottom: -4, display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: 3, borderRadius: 99, background: "#60a5fa", animation: `waveBar 0.7s ease-in-out ${i*0.1}s infinite alternate` }} />)}
        </div>
      )}
    </div>
  );
}

function WebcamFeed({ cameraOn }: { cameraOn: boolean }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => {});
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);
  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = cameraOn; });
  }, [cameraOn]);
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#070f1a", border: "1px solid #1e3a52", width: "100%", height: "100%" }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: cameraOn ? "block" : "none" }} />
      {!cameraOn && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <VideoOff size={28} color="#334e68" />
          <span style={{ fontSize: 12, color: "#334e68" }}>Camera off</span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "block" }} />
        <span style={{ fontSize: 11, color: "#d9e2ec", fontWeight: 600 }}>You</span>
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === "ai";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isAI && <Bot size={11} color="#818cf8" />}
        <span style={{ fontSize: 10, color: "#4a7fa5", fontWeight: 600 }}>{isAI ? "AI Interviewer" : "You"}</span>
        <span style={{ fontSize: 10, color: "#1e3a52" }}>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div style={{ maxWidth: 280, padding: "10px 16px", fontSize: 13.5, lineHeight: 1.6, background: isAI ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)", border: isAI ? "1px solid rgba(99,102,241,0.25)" : "1px solid #1e3a52", color: isAI ? "#c7d2fe" : "#94b4cc", borderRadius: isAI ? "4px 18px 18px 18px" : "18px 4px 18px 18px" }}>
        {msg.content}
      </div>
    </div>
  );
}

function CallControls({ isMuted, isCameraOn, endConfirm, onToggleMute, onToggleCamera, onEndCall }: {
  isMuted: boolean; isCameraOn: boolean; endConfirm: boolean;
  onToggleMute: () => void; onToggleCamera: () => void; onEndCall: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {endConfirm && <p style={{ fontSize: 12, color: "#f59e0b", margin: 0, textAlign: "center" }}>Click End again to confirm.</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <button onClick={onToggleMute} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isMuted ? "#ef4444" : "rgba(255,255,255,0.08)", border: `1px solid ${isMuted ? "#ef4444" : "#1e3a52"}` }}>
            {isMuted ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#94b4cc" />}
          </div>
          <span style={{ fontSize: 10, color: isMuted ? "#ef4444" : "#4a7fa5" }}>{isMuted ? "Unmute" : "Mute"}</span>
        </button>
        <button onClick={onEndCall} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}>
            <PhoneOff size={24} color="#fff" />
          </div>
          <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 600 }}>End</span>
        </button>
        <button onClick={onToggleCamera} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isCameraOn ? "rgba(255,255,255,0.08)" : "#f59e0b", border: `1px solid ${isCameraOn ? "#1e3a52" : "#f59e0b"}` }}>
            {isCameraOn ? <Video size={20} color="#94b4cc" /> : <VideoOff size={20} color="#fff" />}
          </div>
          <span style={{ fontSize: 10, color: "#4a7fa5" }}>{isCameraOn ? "Camera" : "Cam off"}</span>
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function InterviewSessionPage() {
  const params        = useParams();
  const searchParams  = useSearchParams();
  const interviewId   = params.interviewId as string;
  const candidateName = searchParams.get("name") ?? "Candidate";
  const jobTitle       = "Senior Frontend Engineer";
  const jobDescription = "Experienced frontend engineer skilled in React, TypeScript, and modern web performance.";

  const chatRef = useRef<HTMLDivElement>(null);

  const { messages, phase, questionIndex, totalQuestions, isMuted, isCameraOn, elapsedSeconds, error, summary, startInterview, endInterview, toggleMute, toggleCamera } =
    useInterviewSession({ interviewId, candidateName, jobTitle, jobDescription, totalQuestions: 7 });

  const [started, setStarted]       = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  function handleStart()    { setStarted(true); startInterview(); }
  function handleEndClick() { if (!endConfirm) { setEndConfirm(true); return; } endInterview(); }

  const isSpeaking  = phase === "ai-speaking";
  const isListening = phase === "user-speaking";
  const isEnded     = phase === "ended";
  const isSaving    = phase === "saving";

  // ── Summary full-page ──
  if (isEnded && summary) {
    return (
      <div style={{ height: "100%", overflowY: "auto", background: "#070f1a", fontFamily: "system-ui,sans-serif" }}>
        <style>{STYLES}</style>
        <div style={{ display: "flex", alignItems: "center", padding: "0 24px", height: 52, borderBottom: "1px solid #0d1e30", background: "#0a1628", position: "sticky", top: 0, zIndex: 10 }}>
          <Logo /><span style={{ marginLeft: 16, fontSize: 12, color: "#4a7fa5" }}>Interview Summary</span>
        </div>
        <SummaryScreen summary={summary} candidateName={candidateName} elapsedSeconds={elapsedSeconds} />
      </div>
    );
  }

  // ── Session UI ──
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#070f1a", fontFamily: "system-ui,sans-serif", overflow: "hidden" }}>
      <style>{STYLES}</style>

      {/* TOP BAR — fixed height */}
      <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #0d1e30", background: "#0a1628" }}>
        <Logo />
        {started && !isEnded && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#4a7fa5" }}>Q{Math.min(questionIndex + 1, totalQuestions)}/{totalQuestions}</span>
            <div style={{ width: 100, height: 4, borderRadius: 99, background: "#0d1e30" }}>
              <div style={{ width: `${(questionIndex / totalQuestions) * 100}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#3b82f6,#6366f1)", transition: "width 0.5s" }} />
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} color="#4a7fa5" />
          <span style={{ fontSize: 13, color: "#4a7fa5", fontFamily: "monospace" }}>{fmt(elapsedSeconds)}</span>
        </div>
      </div>

      {/* SAVING OVERLAY */}
      {isSaving && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(7,15,26,0.92)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg style={{ animation: "spin 1s linear infinite" }} width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#1e3a52" strokeWidth="4"/>
              <path fill="#3b82f6" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
            </svg>
            <span style={{ fontSize: 15, color: "#94b4cc", fontWeight: 600 }}>Generating your summary…</span>
          </div>
          <p style={{ fontSize: 12, color: "#4a7fa5", margin: 0 }}>Powered by Gemini AI</p>
        </div>
      )}

      {/*
        BODY — fills remaining height.
        Left panel uses CSS GRID with 3 explicit rows:
          row 1: webcam  → fr (takes all leftover space)
          row 2: AI card → auto (natural height)
          row 3: controls/start → auto (natural height)
        This is bulletproof — grid rows can never overflow their container.
      */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: "52%",
          flexShrink: 0,
          borderRight: "1px solid #0d1e30",
          background: "#070f1a",
          padding: 16,
          overflow: "hidden",
          // CSS Grid: row 1 (webcam) grows, rows 2+3 are natural height
          display: "grid",
          gridTemplateRows: "1fr auto auto",
          gap: 12,
        }}>

          {/* Row 1: Webcam */}
          <WebcamFeed cameraOn={isCameraOn} />

          {/* Row 2: AI agent card */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 16, padding: "12px 16px", background: "#0d1f33", border: isSpeaking ? "1px solid rgba(99,102,241,0.4)" : "1px solid #1e3a52", boxShadow: isSpeaking ? "0 0 20px rgba(99,102,241,0.15)" : "none", transition: "all 0.3s" }}>
            <AIAgentAvatar speaking={isSpeaking} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#f0f4f8", margin: 0 }}>AI Interviewer</p>
                <p style={{ fontSize: 11, color: "#4a7fa5", margin: "2px 0 0" }}>Hirely — Falcon Voice</p>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, width: "fit-content", background: isSpeaking ? "rgba(99,102,241,0.12)" : isListening ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${isSpeaking ? "rgba(99,102,241,0.3)" : isListening ? "rgba(16,185,129,0.3)" : "#1e3a52"}` }}>
                {(isSpeaking || isListening) && <span style={{ width: 6, height: 6, borderRadius: "50%", background: isSpeaking ? "#818cf8" : "#10b981", display: "block", animation: "blink 1s infinite" }} />}
                <span style={{ fontSize: 11, fontWeight: 600, color: isSpeaking ? "#818cf8" : isListening ? "#10b981" : "#4a7fa5" }}>
                  {started ? phaseLabel(phase) : "Waiting to start"}
                </span>
              </div>
              {error && <p style={{ fontSize: 11, color: "#ef4444", margin: 0 }}>{error}</p>}
            </div>
          </div>

          {/* Row 3: Start button OR call controls */}
          {!started ? (
            <button onClick={handleStart} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, fontSize: 14, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(37,99,235,0.4)" }}>
              <Mic size={17} /> Start Interview
            </button>
          ) : !isEnded && !isSaving ? (
            <CallControls isMuted={isMuted} isCameraOn={isCameraOn} endConfirm={endConfirm} onToggleMute={toggleMute} onToggleCamera={toggleCamera} onEndCall={handleEndClick} />
          ) : <div />}
        </div>

        {/* ── RIGHT PANEL: chat ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#0a1628" }}>
          <div style={{ height: 52, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "0 20px", borderBottom: "1px solid #0d1e30" }}>
            <MessageSquare size={14} color="#3b82f6" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#d9e2ec" }}>Live Transcript</span>
            {isListening && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 99, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "block", animation: "blink 0.8s infinite" }} />
                <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>Listening</span>
              </div>
            )}
          </div>
          <div ref={chatRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20, scrollBehavior: "smooth" }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.4 }}>
                <MessageSquare size={32} color="#1e3a52" />
                <p style={{ fontSize: 13, color: "#334e68", margin: 0 }}>{started ? "Conversation will appear here…" : "Start the interview to begin"}</p>
              </div>
            )}
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {phase === "ai-thinking" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bot size={13} color="#818cf8" />
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 16px", borderRadius: 16, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", animation: `blink 1s ease-in-out ${i*0.25}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", padding: "10px 20px", borderTop: "1px solid #0d1e30" }}>
            <span style={{ fontSize: 11, color: "#1e3a52" }}>Web Speech API</span>
            <span style={{ fontSize: 11, color: "#1e3a52" }}>Murf Falcon TTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── shared bits ────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Zap size={14} color="#fff" strokeWidth={2.5} />
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Hire<span style={{ color: "#3b82f6" }}>ly</span></span>
    </div>
  );
}

const STYLES = `
  @keyframes ping    { 0%{transform:scale(.8);opacity:.5} 100%{transform:scale(1.5);opacity:0} }
  @keyframes waveBar { 0%{height:3px} 100%{height:14px} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin    { to{transform:rotate(360deg)} }
`;