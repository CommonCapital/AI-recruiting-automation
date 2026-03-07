// app/dashboard/interviews/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Briefcase, Search, Filter, Calendar, Clock,
  Mail, CheckCircle2, X, Loader2, ChevronDown, ChevronUp,
  Eye, RefreshCw, Star, TrendingUp, AlertCircle, Plus,
  MoreVertical, UserCheck, MessageSquare,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  jobType: string;
  status: string;
  createdAt: string;
}

interface InvitedCandidate {
  sessionId: string;
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  status: string;
  startedAt: string;
  createdAt: string;
}

interface CompletedCandidate {
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

interface RecommendationConfig {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}

// ─── Status and Recommendation configs ────────────────────────────────────────
const JOB_STATUS: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  draft:   { label: "Draft",   bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
  active:  { label: "Active",  bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  expired: { label: "Expired", bg: "#fff1f2", color: "#be123c", dot: "#fb7185" },
  closed:  { label: "Closed",  bg: "#f5f3ff", color: "#6d28d9", dot: "#a78bfa" },
};

const RECOMMENDATION: Record<string, RecommendationConfig> = {
  strong_yes: { label: "Strong Hire", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: Star },
  yes:        { label: "Hire",        color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: CheckCircle2 },
  maybe:      { label: "Consider",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: UserCheck },
  no:         { label: "Pass",        color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: X },
  strong_no:  { label: "Strong Pass", color: "#dc2626", bg: "rgba(220,38,38,0.12)",   icon: X },
};

// ─── Helper functions ─────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarGrad(name: string) {
  return [
    "linear-gradient(135deg,#6366f1,#3b82f6)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    "linear-gradient(135deg,#ec4899,#db2777)"
  ][name.charCodeAt(0) % 5];
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getRecommendationConfig(rec: string): RecommendationConfig {
  return RECOMMENDATION[rec] || RECOMMENDATION.maybe;
}

// ─── Components ───────────────────────────────────────────────────────────────
function JobSelector({ jobs, selectedJobId, onJobChange }: {
  jobs: Job[];
  selectedJobId: string | null;
  onJobChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  
  const activeJobs = jobs.filter(j => j.status === "active");
  const selected = activeJobs.find(j => j.id === selectedJobId);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: 320,
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #e5eaf0",
          background: "#fff",
          fontSize: 13.5,
          color: "#334e68",
          cursor: "pointer",
          boxShadow: "0 1px 4px rgba(10,31,51,0.04)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#f0f4f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Briefcase size={14} color="#627d98" />
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0a1f33", margin: 0 }}>
              {selected ? selected.title : "Select a job"}
            </p>
            {selected && (
              <p style={{ fontSize: 11, color: "#829ab1", margin: 0 }}>
                {selected.department || "No department"} · {selected.location || "Remote"}
              </p>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={14} color="#627d98" /> : <ChevronDown size={14} color="#627d98" />}
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 20,
            background: "#fff",
            border: "1px solid #e5eaf0",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(10,31,51,0.12)",
            maxHeight: 300,
            overflowY: "auto",
            marginTop: 6
          }}>
            {activeJobs.length === 0 ? (
              <div style={{ padding: 16, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#829ab1", margin: 0 }}>No active jobs</p>
              </div>
            ) : (
              activeJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => { setOpen(false); onJobChange(job.id); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderBottom: "1px solid #f4f6f8"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: "#f0f4f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <Briefcase size={12} color="#627d98" />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0a1f33", margin: 0 }}>{job.title}</p>
                      <p style={{ fontSize: 11, color: "#829ab1", margin: 0 }}>
                        {job.department || "No department"} · {job.location || "Remote"}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: JOB_STATUS[job.status]?.dot || "#94a3b8"
                  }} />
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CandidateCard({ candidate, type, onView }: {
  candidate: InvitedCandidate | CompletedCandidate;
  type: "invited" | "completed";
  onView: (c: InvitedCandidate | CompletedCandidate) => void;
}) {
  const isCompleted = type === "completed";
  const summary = isCompleted ? (candidate as CompletedCandidate).summary : null;
  const reco = summary ? getRecommendationConfig(summary.recommendation) : null;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5eaf0",
      borderRadius: 14,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      transition: "box-shadow 0.2s, transform 0.15s"
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(10,31,51,0.09)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: avatarGrad(candidate.candidateName),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "#fff"
          }}>
            {initials(candidate.candidateName)}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0a1f33", margin: 0 }}>{candidate.candidateName}</p>
            <p style={{ fontSize: 12, color: "#829ab1", margin: "2px 0 0" }}>{candidate.candidateEmail || "No email"}</p>
          </div>
        </div>
        <button
          onClick={() => onView(candidate)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid #e5eaf0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <Eye size={14} color="#627d98" />
        </button>
      </div>

      {/* Job info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: 99,
          background: "#f0f4f8",
          color: "#486581",
          border: "1px solid #e5eaf0"
        }}>
          {candidate.jobTitle}
        </span>
        {isCompleted && summary && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 99,
            background: reco?.bg || "#f0f4f8",
            color: reco?.color || "#486581",
            border: `1px solid ${reco?.color || "#e5eaf0"}`
          }}>
            {reco?.label || "No recommendation"}
          </span>
        )}
      </div>

      {/* Status and actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isCompleted ? (
            <>
              {summary && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 99,
                  background: reco?.bg || "#f0f4f8",
                  border: `1px solid ${reco?.color || "#e5eaf0"}`
                }}>
                  {reco?.icon && <reco.icon size={12} color={reco.color} />}
                  <span style={{ fontSize: 11, fontWeight: 600, color: reco?.color || "#486581" }}>
                    {summary.overallScore || 0}%
                  </span>
                </div>
              )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 99,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0"
              }}>
                <Clock size={12} color="#15803d" />
                <span style={{ fontSize: 11, color: "#15803d" }}>
                  {formatDuration((candidate as CompletedCandidate).durationSeconds)}
                </span>
              </div>
            </>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 99,
              background: "#eff6ff",
              border: "1px solid #bfdbfe"
            }}>
              <Mail size={12} color="#3b82f6" />
              <span style={{ fontSize: 11, color: "#3b82f6" }}>
                {candidate.status === "in_progress" ? "Invited" : "Pending"}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#829ab1" }}>
            {new Date(isCompleted ? (candidate as CompletedCandidate).completedAt : candidate.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress bar for completed interviews */}
      {isCompleted && summary && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#829ab1" }}>Overall Score</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: reco?.color || "#486581" }}>
              {summary.overallScore || 0}/100
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              width: `${summary.overallScore || 0}%`,
              height: "100%",
              background: reco?.color || "#cbd5e1",
              borderRadius: 99
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBar({ search, onSearch, recommendationFilter, onRecommendationFilter, onRefresh }: {
  search: string;
  onSearch: (s: string) => void;
  recommendationFilter: string;
  onRecommendationFilter: (r: string) => void;
  onRefresh: () => void;
}) {
  const [recommendationOpen, setRecommendationOpen] = useState(false);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "#fff",
      border: "1px solid #e5eaf0",
      borderRadius: 12,
      marginBottom: 16
    }}>
      {/* Search */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flex: 1,
        maxWidth: 300,
        background: "#f8fafc",
        border: "1px solid #e5eaf0",
        borderRadius: 9,
        padding: "8px 12px"
      }}>
        <Search size={14} color="#bcccdc" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search candidates..."
          style={{
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#334e68",
            background: "transparent",
            width: "100%"
          }}
        />
        {search && (
          <button onClick={() => onSearch("")} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={14} color="#bcccdc" />
          </button>
        )}
      </div>

      {/* Recommendation filter */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setRecommendationOpen(!recommendationOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 9,
            border: "1px solid #e5eaf0",
            background: "#fff",
            fontSize: 13,
            color: "#334e68",
            cursor: "pointer"
          }}
        >
          <Filter size={14} color="#627d98" />
          <span>Recommendation</span>
          <ChevronDown size={12} color="#627d98" />
        </button>

        {recommendationOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setRecommendationOpen(false)} />
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 20,
              background: "#fff",
              border: "1px solid #e5eaf0",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(10,31,51,0.12)",
              minWidth: 200,
              marginTop: 6
            }}>
              {Object.entries(RECOMMENDATION).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setRecommendationOpen(false); onRecommendationFilter(key); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderBottom: "1px solid #f4f6f8"
                  }}
                >
                  <config.icon size={14} color={config.color} />
                  <span style={{ fontSize: 13, color: "#334e68" }}>{config.label}</span>
                  {recommendationFilter === key && (
                    <div style={{
                      marginLeft: "auto",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: config.color
                    }} />
                  )}
                </button>
              ))}
              <button
                onClick={() => { setRecommendationOpen(false); onRecommendationFilter("all"); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer"
                }}
              >
                <TrendingUp size={14} color="#627d98" />
                <span style={{ fontSize: 13, color: "#334e68" }}>All Recommendations</span>
                {recommendationFilter === "all" && (
                  <div style={{
                    marginLeft: "auto",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#627d98"
                  }} />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 9,
          border: "1px solid #e5eaf0",
          background: "#fff",
          fontSize: 13,
          color: "#334e68",
          cursor: "pointer"
        }}
      >
        <RefreshCw size={14} color="#627d98" />
        <span>Refresh</span>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InterviewsPage() {
  const router = useRouter();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [invitedCandidates, setInvitedCandidates] = useState<InvitedCandidate[]>([]);
  const [completedCandidates, setCompletedCandidates] = useState<CompletedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState("all");

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch jobs");
      setJobs(json.jobs || []);
      
      // Auto-select first active job if none selected
      if (!selectedJobId && json.jobs?.length > 0) {
        const activeJob = json.jobs.find((j: Job) => j.status === "active");
        if (activeJob) setSelectedJobId(activeJob.id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [selectedJobId]);

  // Fetch candidates for selected job
  const fetchCandidates = useCallback(async () => {
    if (!selectedJobId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch invited candidates
      const invitedRes = await fetch(`/api/interviews/jobs/${selectedJobId}/invited`);
      const invitedJson = await invitedRes.json();
      if (!invitedRes.ok) throw new Error(invitedJson.error || "Failed to fetch invited candidates");
      setInvitedCandidates(invitedJson.invited || []);
      
      // Fetch completed candidates
      const completedRes = await fetch(`/api/interviews/jobs/${selectedJobId}/completed`);
      const completedJson = await completedRes.json();
      if (!completedRes.ok) throw new Error(completedJson.error || "Failed to fetch completed candidates");
      setCompletedCandidates(completedJson.completed || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedJobId]);

  // Effects
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Filter candidates
  const filteredInvited = invitedCandidates.filter(c => {
    const q = search.toLowerCase();
    return !q || 
      c.candidateName.toLowerCase().includes(q) ||
      c.candidateEmail?.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q);
  });

  const filteredCompleted = completedCandidates.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      c.candidateName.toLowerCase().includes(q) ||
      c.candidateEmail?.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q);
    
    const matchesRecommendation = recommendationFilter === "all" || 
      (c.summary && c.summary.recommendation === recommendationFilter);
    
    return matchesSearch && matchesRecommendation;
  });

  // Handlers
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleRefresh = () => {
    fetchCandidates();
  };

  const handleViewCandidate = (candidate: InvitedCandidate | CompletedCandidate) => {
    // Navigate to the existing interview session page
    router.push(`/dashboard/interview/${candidate.sessionId}/session`);
  };

  // Stats
  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const totalInvited = filteredInvited.length;
  const totalCompleted = filteredCompleted.length;
  const completionRate = totalInvited > 0 ? Math.round((totalCompleted / totalInvited) * 100) : 0;

  return (
    <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Interview Schedule</h1>
          <p style={{ fontSize: 13, color: "#829ab1", margin: "3px 0 0" }}>
            Track interview progress and results for your active job postings
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e5eaf0"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 99,
              background: "#eff6ff",
              border: "1px solid #bfdbfe"
            }}>
              <MessageSquare size={12} color="#3b82f6" />
              <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>Invited: {totalInvited}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 99,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0"
            }}>
              <CheckCircle2 size={12} color="#15803d" />
              <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>Completed: {totalCompleted}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              borderRadius: 99,
              background: "#fff7ed",
              border: "1px solid #fed7aa"
            }}>
              <TrendingUp size={12} color="#c2410c" />
              <span style={{ fontSize: 12, color: "#c2410c", fontWeight: 600 }}>Completion: {completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Selector */}
      <div style={{ marginBottom: 16 }}>
        <JobSelector jobs={jobs} selectedJobId={selectedJobId} onJobChange={handleJobChange} />
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 10,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          marginBottom: 16
        }}>
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
        </div>
      )}

      {/* No job selected */}
      {!selectedJobId && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 20px",
          gap: 16,
          background: "#fff",
          border: "1px solid #e5eaf0",
          borderRadius: 14
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "#f8fafc",
            border: "1.5px dashed #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Users size={28} color="#cbd5e1" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#475569", margin: 0 }}>Select a job to view interview schedule</p>
            <p style={{ fontSize: 13, color: "#829ab1", margin: "4px 0 0" }}>Choose from the dropdown above to see candidates for a specific position</p>
          </div>
        </div>
      )}

      {/* Main content */}
      {selectedJobId && (
        <>
          {/* Filters */}
          <FilterBar
            search={search}
            onSearch={setSearch}
            recommendationFilter={recommendationFilter}
            onRecommendationFilter={setRecommendationFilter}
            onRefresh={handleRefresh}
          />

          {/* Two-grid layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            
            {/* Left: Invited Candidates */}
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Mail size={16} color="#3b82f6" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0a1f33", margin: 0 }}>Invited Candidates</h2>
                    <p style={{ fontSize: 12, color: "#829ab1", margin: "2px 0 0" }}>
                      Candidates who have been sent interview invitations
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#3b82f6",
                  background: "#eff6ff",
                  padding: "4px 8px",
                  borderRadius: 99,
                  border: "1px solid #bfdbfe"
                }}>
                  {totalInvited} candidates
                </span>
              </div>

              {loading ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  background: "#fff",
                  border: "1px solid #e5eaf0",
                  borderRadius: 14
                }}>
                  <Loader2 size={20} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ marginLeft: 8, fontSize: 13, color: "#829ab1" }}>Loading invited candidates...</span>
                </div>
              ) : filteredInvited.length === 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  background: "#fff",
                  border: "1px solid #e5eaf0",
                  borderRadius: 14
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1.5px dashed #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12
                  }}>
                    <Mail size={20} color="#cbd5e1" />
                  </div>
                  <p style={{ fontSize: 14, color: "#627d98", margin: 0 }}>
                    No invited candidates for this job
                  </p>
                  <p style={{ fontSize: 12, color: "#829ab1", margin: "4px 0 0" }}>
                    Send interview invitations from the Jobs page
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {filteredInvited.map(candidate => (
                    <CandidateCard
                      key={candidate.sessionId}
                      candidate={candidate}
                      type="invited"
                      onView={handleViewCandidate}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Completed Interviews */}
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <CheckCircle2 size={16} color="#15803d" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0a1f33", margin: 0 }}>Completed Interviews</h2>
                    <p style={{ fontSize: 12, color: "#829ab1", margin: "2px 0 0" }}>
                      Candidates who have finished their interviews
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#15803d",
                  background: "#f0fdf4",
                  padding: "4px 8px",
                  borderRadius: 99,
                  border: "1px solid #bbf7d0"
                }}>
                  {totalCompleted} interviews
                </span>
              </div>

              {loading ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  background: "#fff",
                  border: "1px solid #e5eaf0",
                  borderRadius: 14
                }}>
                  <Loader2 size={20} color="#15803d" style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ marginLeft: 8, fontSize: 13, color: "#829ab1" }}>Loading completed interviews...</span>
                </div>
              ) : filteredCompleted.length === 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px",
                  background: "#fff",
                  border: "1px solid #e5eaf0",
                  borderRadius: 14
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1.5px dashed #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12
                  }}>
                    <CheckCircle2 size={20} color="#cbd5e1" />
                  </div>
                  <p style={{ fontSize: 14, color: "#627d98", margin: 0 }}>
                    No completed interviews for this job
                  </p>
                  <p style={{ fontSize: 12, color: "#829ab1", margin: "4px 0 0" }}>
                    Candidates will appear here after completing their interviews
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {filteredCompleted.map(candidate => (
                    <CandidateCard
                      key={candidate.sessionId}
                      candidate={candidate}
                      type="completed"
                      onView={handleViewCandidate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}