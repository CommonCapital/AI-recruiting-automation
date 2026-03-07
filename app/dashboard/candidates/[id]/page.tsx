// app/(dashboard)/dashboard/candidates/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Link2, Github, Linkedin, FileText, Calendar, Clock,
  Edit2, Save, X, Trash2, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, User, StickyNote,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  id: string; fullName: string; email: string | null; phone: string | null;
  location: string | null; linkedinUrl: string | null; portfolioUrl: string | null;
  jobTitle: string | null; currentCompany: string | null; experienceYears: number | null;
  skills: string[]; education: string | null; summary: string | null;
  resumeFileName: string | null; status: string; notes: string | null;
  createdAt: string; updatedAt: string;
}

const STATUS: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  new:                 { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6",  label: "New" },
  reviewing:           { bg: "#fffbeb", color: "#b45309", dot: "#f59e0b",  label: "Reviewing" },
  interview_scheduled: { bg: "#f5f3ff", color: "#6d28d9", dot: "#8b5cf6",  label: "Interview Scheduled" },
  interviewed:         { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e",  label: "Interviewed" },
  offer_sent:          { bg: "#fff7ed", color: "#c2410c", dot: "#f97316",  label: "Offer Sent" },
  hired:               { bg: "#dcfce7", color: "#166534", dot: "#16a34a",  label: "Hired" },
  rejected:            { bg: "#fef2f2", color: "#b91c1c", dot: "#ef4444",  label: "Rejected" },
};

function initials(n: string) { return n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }
function grad(n: string) { return ["linear-gradient(135deg,#6366f1,#3b82f6)", "linear-gradient(135deg,#10b981,#059669)", "linear-gradient(135deg,#f59e0b,#d97706)", "linear-gradient(135deg,#8b5cf6,#7c3aed)", "linear-gradient(135deg,#ec4899,#db2777)"][n.charCodeAt(0) % 5]; }

// ─── Small reusable pieces ────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f4f6f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <Icon size={14} color="#829ab1" />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#bcccdc", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13.5, color: "#2563eb", textDecoration: "none", fontWeight: 500, wordBreak: "break-all" }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
            {value}
          </a>
        ) : (
          <p style={{ fontSize: 13.5, color: "#334e68", margin: 0, wordBreak: "break-word" }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function Card({ children, title, icon: Icon, action }: { children: React.ReactNode; title: string; icon: React.ElementType; action?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f4f6f8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={13} color="#627d98" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0a1f33" }}>{title}</span>
        </div>
        {action}
      </div>
      <div style={{ padding: "16px 18px" }}>{children}</div>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#829ab1", display: "block", marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1.5px solid #e5eaf0", fontSize: 13, color: "#334e68", outline: "none", boxSizing: "border-box", background: "#fafbfc" }}
        onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
        onBlur={e => (e.currentTarget.style.borderColor = "#e5eaf0")} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);

  // Edit mode state
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState<Partial<Candidate>>({});
  const [skillsInput, setSkillsInput] = useState(""); // separate string for skills edit field
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<{ ok: boolean; text: string } | null>(null);

  // Status update
  const [statusLoading, setStatusLoading] = useState(false);

  // Delete confirm
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    fetch(`/api/candidates/${id}`)
      .then(r => r.json())
      .then(j => {
        if (j.error) { setNotFound(true); return; }
        setCandidate(j.candidate);
        setDraft(j.candidate);
        setSkillsInput(Array.isArray(j.candidate.skills) ? j.candidate.skills.join(", ") : "");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function d(k: keyof Candidate) {
    return (v: string) => setDraft(p => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true); setSaveMsg(null);
    try {
      const res  = await fetch(`/api/candidates/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          skills: skillsInput.split(",").map((s: string) => s.trim()).filter(Boolean),
          experienceYears: draft.experienceYears ? Number(draft.experienceYears) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCandidate(json.candidate);
      setDraft(json.candidate);
      setSkillsInput(Array.isArray(json.candidate.skills) ? json.candidate.skills.join(", ") : "");
      setEditing(false);
      setSaveMsg({ ok: true, text: "Changes saved." });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSaveMsg({ ok: false, text: e.message ?? "Save failed." });
    } finally { setSaving(false); }
  }

  async function handleStatusChange(status: string) {
    if (!candidate) return;
    setStatusLoading(true);
    const res  = await fetch(`/api/candidates/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    setCandidate(json.candidate);
    setStatusLoading(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/candidates/${id}`, { method: "DELETE" });
    router.push("/dashboard/candidates");
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 10, fontFamily: "system-ui,sans-serif" }}>
      <Loader2 size={22} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 14, color: "#829ab1" }}>Loading candidate…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !candidate) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16, fontFamily: "system-ui,sans-serif" }}>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#486581" }}>Candidate not found.</p>
      <button onClick={() => router.push("/dashboard/candidates")}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "#f0f4f8", color: "#486581", fontWeight: 600, cursor: "pointer" }}>
        <ArrowLeft size={14} /> Back to Candidates
      </button>
    </div>
  );

  const s = STATUS[candidate.status] ?? STATUS.new;
  return (
    <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif", maxWidth: 1100 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Breadcrumb + back ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <button onClick={() => router.push("/dashboard/candidates")}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1px solid #e5eaf0", background: "#f8fafc", fontSize: 12.5, fontWeight: 600, color: "#627d98", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f0f4f8")}
          onMouseLeave={e => (e.currentTarget.style.background = "#f8fafc")}>
          <ArrowLeft size={13} /> Candidates
        </button>
        <span style={{ fontSize: 12.5, color: "#d1d5db" }}>/</span>
        <span style={{ fontSize: 12.5, color: "#829ab1" }}>{candidate.fullName}</span>
      </div>

      {/* ── Hero header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: grad(candidate.fullName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {initials(candidate.fullName)}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a1f33", margin: "0 0 4px" }}>{candidate.fullName}</h1>
            <p style={{ fontSize: 14, color: "#627d98", margin: "0 0 8px" }}>
              {candidate.jobTitle ?? "No title"}
              {candidate.currentCompany ? <span style={{ color: "#bcccdc" }}> · {candidate.currentCompany}</span> : null}
            </p>
            {/* Status pill + dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, padding: "4px 11px", borderRadius: 99, background: s.bg, color: s.color }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "block" }} />
                {s.label}
              </span>
              <div style={{ position: "relative" }}>
                {statusLoading
                  ? <Loader2 size={14} color="#829ab1" style={{ animation: "spin 1s linear infinite" }} />
                  : (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <select value={candidate.status} onChange={e => handleStatusChange(e.target.value)}
                        style={{ appearance: "none", padding: "4px 28px 4px 10px", borderRadius: 8, border: "1px solid #e5eaf0", fontSize: 12, color: "#486581", background: "#f8fafc", cursor: "pointer", outline: "none" }}>
                        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <ChevronDown size={11} color="#bcccdc" style={{ position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setDraft(candidate); setSkillsInput(Array.isArray(candidate.skills) ? candidate.skills.join(", ") : ""); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "1px solid #e5eaf0", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#627d98", cursor: "pointer" }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 9, border: "none", background: saving ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(37,99,235,0.25)" }}>
                {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "1px solid #e5eaf0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#334e68", cursor: "pointer" }}>
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => setConfirmDel(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1px solid #fee2e2", background: "#fef2f2", fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}>
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save notification */}
      {saveMsg && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, marginBottom: 20, background: saveMsg.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${saveMsg.ok ? "#bbf7d0" : "#fca5a5"}` }}>
          {saveMsg.ok ? <CheckCircle2 size={14} color="#10b981" /> : <AlertCircle size={14} color="#ef4444" />}
          <span style={{ fontSize: 13, color: saveMsg.ok ? "#15803d" : "#dc2626" }}>{saveMsg.text}</span>
        </div>
      )}

      {/* ── Two column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, alignItems: "start" }}>

        {/* LEFT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary */}
          {(editing || candidate.summary) && (
            <Card title="Summary" icon={FileText}>
              {editing ? (
                <textarea value={(draft.summary as string) ?? ""} onChange={e => setDraft(p => ({ ...p, summary: e.target.value }))}
                  placeholder="Professional summary…" rows={4}
                  style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1.5px solid #e5eaf0", fontSize: 13, color: "#334e68", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5eaf0")} />
              ) : (
                <p style={{ fontSize: 13.5, color: "#486581", lineHeight: 1.8, margin: 0 }}>{candidate.summary}</p>
              )}
            </Card>
          )}

          {/* Professional details */}
          <Card title="Professional" icon={Briefcase}>
            {editing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <EditField label="Job Title"          value={(draft.jobTitle as string) ?? ""}        onChange={d("jobTitle")}        placeholder="Senior Frontend Engineer" />
                <EditField label="Current Company"    value={(draft.currentCompany as string) ?? ""}  onChange={d("currentCompany")}  placeholder="Acme Corp" />
                <EditField label="Years Experience"   value={String(draft.experienceYears ?? "")}      onChange={d("experienceYears")} placeholder="5" type="number" />
                <EditField label="Education"          value={(draft.education as string) ?? ""}        onChange={d("education")}       placeholder="B.Sc CS, MIT" />
                <div style={{ gridColumn: "1/-1" }}>
                  <EditField label="Skills (comma separated)" value={skillsInput} onChange={setSkillsInput} placeholder="React, TypeScript, Node.js" />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <InfoRow icon={Briefcase}        label="Title"      value={candidate.jobTitle} />
                <InfoRow icon={Briefcase}        label="Company"    value={candidate.currentCompany} />
                <InfoRow icon={Clock}            label="Experience" value={candidate.experienceYears != null ? `${candidate.experienceYears} years` : null} />
                <InfoRow icon={GraduationCap}    label="Education"  value={candidate.education} />
                {candidate.skills?.length > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f4f6f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle2 size={14} color="#829ab1" />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#bcccdc", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {candidate.skills.map(sk => (
                          <span key={sk} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#f0f4f8", color: "#486581", border: "1px solid #e5eaf0" }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card title="Recruiter Notes" icon={StickyNote}>
            {editing ? (
              <textarea value={(draft.notes as string) ?? ""} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
                placeholder="Internal notes for the hiring team…" rows={4}
                style={{ width: "100%", padding: "9px 11px", borderRadius: 9, border: "1.5px solid #e5eaf0", fontSize: 13, color: "#334e68", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5eaf0")} />
            ) : candidate.notes ? (
              <p style={{ fontSize: 13.5, color: "#486581", lineHeight: 1.8, margin: 0 }}>{candidate.notes}</p>
            ) : (
              <p style={{ fontSize: 13, color: "#bcccdc", margin: 0, fontStyle: "italic" }}>No notes yet. Click Edit to add notes.</p>
            )}
          </Card>
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Contact */}
          <Card title="Contact" icon={User}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <EditField label="Full Name"  value={(draft.fullName as string) ?? ""}  onChange={d("fullName")}  placeholder="Sarah Chen" />
                <EditField label="Email"      value={(draft.email as string) ?? ""}     onChange={d("email")}     placeholder="sarah@example.com" />
                <EditField label="Phone"      value={(draft.phone as string) ?? ""}     onChange={d("phone")}     placeholder="+1 555 0000" />
                <EditField label="Location"   value={(draft.location as string) ?? ""}  onChange={d("location")}  placeholder="New York, USA" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoRow icon={Mail}    label="Email"    value={candidate.email}    href={candidate.email ? `mailto:${candidate.email}` : undefined} />
                <InfoRow icon={Phone}   label="Phone"    value={candidate.phone}    href={candidate.phone ? `tel:${candidate.phone}` : undefined} />
                <InfoRow icon={MapPin}  label="Location" value={candidate.location} />
              </div>
            )}
          </Card>

          {/* Links */}
          <Card title="Links" icon={Link2}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                <EditField label="LinkedIn URL"    value={(draft.linkedinUrl as string) ?? ""}  onChange={d("linkedinUrl")}  placeholder="linkedin.com/in/sarah" />
                <EditField label="Portfolio / GitHub" value={(draft.portfolioUrl as string) ?? ""} onChange={d("portfolioUrl")} placeholder="github.com/sarah" />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <InfoRow icon={Linkedin} label="LinkedIn"  value={candidate.linkedinUrl}  href={candidate.linkedinUrl ?? undefined} />
                <InfoRow icon={Github}   label="Portfolio" value={candidate.portfolioUrl} href={candidate.portfolioUrl ?? undefined} />
                {!candidate.linkedinUrl && !candidate.portfolioUrl && (
                  <p style={{ fontSize: 13, color: "#bcccdc", margin: 0, fontStyle: "italic" }}>No links added.</p>
                )}
              </div>
            )}
          </Card>

          {/* Meta */}
          <Card title="Details" icon={Calendar}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {candidate.resumeFileName && (
                <InfoRow icon={FileText} label="Resume" value={candidate.resumeFileName} />
              )}
              <InfoRow icon={Calendar} label="Added"   value={new Date(candidate.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              <InfoRow icon={Clock}    label="Updated" value={new Date(candidate.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Delete confirm modal ── */}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,31,51,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 24px 64px rgba(10,31,51,0.18)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0a1f33", margin: "0 0 8px" }}>Delete Candidate</h3>
            <p style={{ fontSize: 13.5, color: "#627d98", margin: "0 0 24px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#334e68" }}>{candidate.fullName}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5eaf0", background: "#f8fafc", fontSize: 13.5, fontWeight: 600, color: "#486581", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#ef4444", fontSize: 13.5, fontWeight: 600, color: "#fff", cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {deleting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}