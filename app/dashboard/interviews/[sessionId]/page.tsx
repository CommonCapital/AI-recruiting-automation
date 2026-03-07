// app/dashboard/interviews/[sessionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, Clock, CheckCircle2, Star, TrendingUp, AlertCircle } from "lucide-react";

interface InterviewSession {
  sessionId: string;
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  status: string;
  summary: any; // InterviewSummary
  durationSeconds: number | null;
  questionsAnswered: number | null;
  totalQuestions: number | null;
  completedAt: string;
  createdAt: string;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/interviews/jobs/sessions/${sessionId}`);
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || "Failed to fetch interview session");
        setSession(json.session);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRecommendationConfig = (rec: string) => {
    const configs: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      strong_yes: { label: "Strong Hire", color: "#10b981", icon: Star },
      yes:        { label: "Hire",        color: "#3b82f6", icon: CheckCircle2 },
      maybe:      { label: "Consider",    color: "#f59e0b", icon: TrendingUp },
      no:         { label: "Pass",        color: "#ef4444", icon: AlertCircle },
      strong_no:  { label: "Strong Pass", color: "#dc2626", icon: AlertCircle },
    };
    return configs[rec] || configs.maybe;
  };

  if (loading) {
    return (
      <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5eaf0", background: "#fff", cursor: "pointer" }}>
            <ArrowLeft size={14} color="#627d98" />
            <span style={{ fontSize: 13, color: "#627d98" }}>Back</span>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Interview Details</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 20, height: 20, border: "2px solid #e5eaf0", borderRadius: "50%", borderTopColor: "#3b82f6", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 14, color: "#829ab1" }}>Loading interview details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5eaf0", background: "#fff", cursor: "pointer" }}>
            <ArrowLeft size={14} color="#627d98" />
            <span style={{ fontSize: 13, color: "#627d98" }}>Back</span>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Interview Details</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14 }}>
          <AlertCircle size={32} color="#ef4444" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: "#ef4444", margin: "0 0 8px" }}>Error Loading Interview</p>
          <p style={{ fontSize: 14, color: "#829ab1", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5eaf0", background: "#fff", cursor: "pointer" }}>
            <ArrowLeft size={14} color="#627d98" />
            <span style={{ fontSize: 13, color: "#627d98" }}>Back</span>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Interview Details</h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px", background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14 }}>
          <Eye size={32} color="#829ab1" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 16, color: "#829ab1", margin: "0 0 8px" }}>Interview Not Found</p>
          <p style={{ fontSize: 14, color: "#627d98", margin: 0 }}>This interview session could not be found.</p>
        </div>
      </div>
    );
  }

  const reco = session.summary ? getRecommendationConfig(session.summary.recommendation) : null;

  return (
    <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #e5eaf0", background: "#fff", cursor: "pointer" }}>
          <ArrowLeft size={14} color="#627d98" />
          <span style={{ fontSize: 13, color: "#627d98" }}>Back</span>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Interview Details</h1>
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        
        {/* Left: Interview Summary */}
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0a1f33", margin: 0 }}>{session.candidateName}</h2>
              <p style={{ fontSize: 13, color: "#829ab1", margin: "4px 0 0" }}>{session.candidateEmail || "No email provided"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#829ab1" }}>{new Date(session.completedAt).toLocaleDateString()}</span>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 99,
                background: session.status === "completed" ? "#f0fdf4" : "#eff6ff",
                border: session.status === "completed" ? "1px solid #bbf7d0" : "1px solid #bfdbfe"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: session.status === "completed" ? "#15803d" : "#3b82f6", display: "block" }} />
                <span style={{ fontSize: 11, color: session.status === "completed" ? "#15803d" : "#3b82f6", fontWeight: 600 }}>
                  {session.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>
            </div>
          </div>

          {/* Job info */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: "0 0 8px" }}>Position</h3>
            <p style={{ fontSize: 14, color: "#334e68", margin: 0 }}>{session.jobTitle}</p>
          </div>

          {/* Interview stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "#f8fafc", border: "1px solid #e5eaf0", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#829ab1", marginBottom: 4 }}>Duration</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#334e68" }}>{formatDuration(session.durationSeconds)}</div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e5eaf0", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#829ab1", marginBottom: 4 }}>Questions</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#334e68" }}>{session.questionsAnswered || 0}/{session.totalQuestions || 0}</div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e5eaf0", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: "#829ab1", marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: session.status === "completed" ? "#15803d" : "#f59e0b" }}>
                {session.status === "completed" ? "Completed" : "In Progress"}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          {session.summary ? (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: "0 0 12px" }}>AI Evaluation</h3>
              <div style={{ background: "#f8fafc", border: "1px solid #e5eaf0", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  {reco && <reco.icon size={20} color={reco.color} />}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: reco?.color || "#334e68" }}>{reco?.label || "No recommendation"}</div>
                    <div style={{ fontSize: 12, color: "#829ab1" }}>Overall Score: {session.summary.overallScore || 0}/100</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#627d98", lineHeight: 1.6 }}>
                  {session.summary.headline || "No summary available"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, color: "#c2410c", fontWeight: 600, marginBottom: 4 }}>No AI Summary Available</div>
              <div style={{ fontSize: 12, color: "#829ab1" }}>This interview has not been completed or processed by AI yet.</div>
            </div>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Candidate Info Card */}
          <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: "0 0 12px" }}>Candidate Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: "#829ab1", minWidth: 60 }}>Name:</span>
                <span style={{ fontSize: 13, color: "#334e68", fontWeight: 500 }}>{session.candidateName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: "#829ab1", minWidth: 60 }}>Email:</span>
                <span style={{ fontSize: 13, color: "#334e68", fontWeight: 500 }}>{session.candidateEmail || "Not provided"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: "#829ab1", minWidth: 60 }}>Job:</span>
                <span style={{ fontSize: 13, color: "#334e68", fontWeight: 500 }}>{session.jobTitle}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: "0 0 12px" }}>Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5eaf0",
                background: "#fff", color: "#334e68", fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
                View Full Transcript
              </button>
              <button style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5eaf0",
                background: "#fff", color: "#334e68", fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
                Download Report
              </button>
              <button style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5eaf0",
                background: "#fff", color: "#334e68", fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
                Contact Candidate
              </button>
            </div>
          </div>

          {/* Status Summary */}
          {session.summary && (
            <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: "0 0 12px" }}>Quick Stats</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: "#829ab1" }}>Overall Score</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: reco?.color || "#334e68" }}>{session.summary.overallScore || 0}/100</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: "#829ab1" }}>Recommendation</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: reco?.color || "#334e68" }}>{reco?.label || "No recommendation"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 12, color: "#829ab1" }}>Duration</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334e68" }}>{formatDuration(session.durationSeconds)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}