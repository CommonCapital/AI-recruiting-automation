// app/(dashboard)/dashboard/candidates/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Users, Plus, Search, Upload, LayoutGrid, List,
  X, CheckCircle2, AlertCircle, Loader2,
  MapPin, Mail, Phone, Briefcase,
  ExternalLink, FileText, ChevronDown, UserPlus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  jobTitle: string | null;
  currentCompany: string | null;
  experienceYears: number | null;
  skills: string[];
  education: string | null;
  summary: string | null;
  resumeFileName: string | null;
  status: string;
  createdAt: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  jobTitle: string;
  currentCompany: string;
  experienceYears: string;
  skills: string;
  education: string;
  summary: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  fullName: "", email: "", phone: "", location: "",
  linkedinUrl: "", portfolioUrl: "", jobTitle: "",
  currentCompany: "", experienceYears: "", skills: "",
  education: "", summary: "", notes: "",
};

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  new:                  { bg: "#dbeafe", color: "#1d4ed8", label: "New" },
  reviewing:            { bg: "#fef3c7", color: "#d97706", label: "Reviewing" },
  interview_scheduled:  { bg: "#ede9fe", color: "#7c3aed", label: "Interview Scheduled" },
  interviewed:          { bg: "#d1fae5", color: "#059669", label: "Interviewed" },
  offer_sent:           { bg: "#ffedd5", color: "#ea580c", label: "Offer Sent" },
  hired:                { bg: "#dcfce7", color: "#15803d", label: "Hired" },
  rejected:             { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
function avatarGradient(name: string) {
  const gradients = [
    "linear-gradient(135deg,#3b82f6,#6366f1)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    "linear-gradient(135deg,#ec4899,#db2777)",
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
}

// ─── Candidate Card (grid view) ───────────────────────────────────────────────
function CandidateCard({ c }: { c: Candidate }) {
  const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.new;
  return (
    <div style={{ background: "#fff", border: "1px solid #d9e2ec", borderRadius: 16, padding: "20px", boxShadow: "0 2px 8px rgba(10,31,51,0.05)", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 6px 24px rgba(10,31,51,0.1)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(10,31,51,0.05)")}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: avatarGradient(c.fullName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials(c.fullName)}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0a1f33", margin: 0 }}>{c.fullName}</p>
            <p style={{ fontSize: 12, color: "#829ab1", margin: "2px 0 0" }}>{c.jobTitle ?? "No title"}</p>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, whiteSpace: "nowrap", flexShrink: 0 }}>
          {s.label}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {c.email && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Mail size={12} color="#829ab1" />
            <span style={{ fontSize: 12, color: "#627d98", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
          </div>
        )}
        {c.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={12} color="#829ab1" />
            <span style={{ fontSize: 12, color: "#627d98" }}>{c.location}</span>
          </div>
        )}
        {c.currentCompany && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Briefcase size={12} color="#829ab1" />
            <span style={{ fontSize: 12, color: "#627d98" }}>{c.currentCompany}{c.experienceYears ? ` · ${c.experienceYears}y exp` : ""}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {c.skills?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {c.skills.slice(0, 4).map(skill => (
            <span key={skill} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f0f4f8", color: "#486581", border: "1px solid #d9e2ec" }}>{skill}</span>
          ))}
          {c.skills.length > 4 && (
            <span style={{ fontSize: 10, color: "#829ab1" }}>+{c.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f0f4f8" }}>
        <span style={{ fontSize: 11, color: "#bcccdc" }}>
          Added {new Date(c.createdAt).toLocaleDateString()}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {c.resumeFileName && <FileText size={14} color="#829ab1" />}
          {c.linkedinUrl && <ExternalLink size={14} color="#829ab1" />}
        </div>
      </div>
    </div>
  );
}

// ─── Candidate Row (list view) ────────────────────────────────────────────────
function CandidateRow({ c }: { c: Candidate }) {
  const s = STATUS_STYLES[c.status] ?? STATUS_STYLES.new;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: "1px solid #f0f4f8", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: avatarGradient(c.fullName), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
        {initials(c.fullName)}
      </div>
      <div style={{ flex: "0 0 200px", minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#0a1f33", margin: 0 }}>{c.fullName}</p>
        <p style={{ fontSize: 11.5, color: "#829ab1", margin: 0 }}>{c.email ?? "—"}</p>
      </div>
      <div style={{ flex: "0 0 180px" }}>
        <p style={{ fontSize: 13, color: "#334e68", margin: 0 }}>{c.jobTitle ?? "—"}</p>
        <p style={{ fontSize: 11.5, color: "#829ab1", margin: 0 }}>{c.currentCompany ?? ""}</p>
      </div>
      <div style={{ flex: "0 0 120px" }}>
        <p style={{ fontSize: 12, color: "#627d98", margin: 0 }}>{c.location ?? "—"}</p>
      </div>
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4 }}>
        {c.skills?.slice(0, 3).map(skill => (
          <span key={skill} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: "#f0f4f8", color: "#486581", border: "1px solid #d9e2ec" }}>{skill}</span>
        ))}
      </div>
      <div style={{ flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
      </div>
      <span style={{ fontSize: 11, color: "#bcccdc", flexShrink: 0 }}>
        {new Date(c.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}

// ─── Add Candidate Dialog ─────────────────────────────────────────────────────
function AddCandidateDialog({ onClose, onSaved }: { onClose: () => void; onSaved: (c: Candidate) => void }) {
  const [step, setStep]             = useState<"upload" | "form">("upload");
  const [form, setForm]             = useState<FormData>(EMPTY_FORM);
  const [parsing, setParsing]       = useState(false);
  const [parseError, setParseError] = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");
  const [fileName, setFileName]     = useState("");
  const [resumeText, setResumeText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function field(k: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));
  }

  async function handleFile(file: File) {
    if (!file) return;
    setParseError("");
    setParsing(true);
    setFileName(file.name);

    const fd = new FormData();
    fd.append("resume", file);

    try {
      const res  = await fetch("/api/candidates/parse-resume", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Parse failed");

      const d = json.data;
      setForm({
        fullName:        d.fullName        ?? "",
        email:           d.email           ?? "",
        phone:           d.phone           ?? "",
        location:        d.location        ?? "",
        linkedinUrl:     d.linkedinUrl     ?? "",
        portfolioUrl:    d.portfolioUrl    ?? "",
        jobTitle:        d.jobTitle        ?? "",
        currentCompany:  d.currentCompany  ?? "",
        experienceYears: d.experienceYears != null ? String(d.experienceYears) : "",
        skills:          Array.isArray(d.skills) ? d.skills.join(", ") : "",
        education:       d.education       ?? "",
        summary:         d.summary         ?? "",
        notes: "",
      });
      setStep("form");
    } catch (e: any) {
      setParseError(e.message ?? "Failed to parse resume");
    } finally {
      setParsing(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSave() {
    if (!form.fullName.trim()) { setSaveError("Full name is required."); return; }
    setSaving(true); setSaveError("");
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
          skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
          resumeFileName: fileName || null,
          resumeText: resumeText || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      onSaved(json.candidate);
    } catch (e: any) {
      setSaveError(e.message ?? "Failed to save");
      setSaving(false);
    }
  }

  return (
    // Backdrop
    <div
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,31,51,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(10,31,51,0.2)", display: "flex", flexDirection: "column" }}>

        {/* Dialog header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f0f4f8", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserPlus size={17} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0a1f33", margin: 0 }}>Add Candidate</h2>
              <p style={{ fontSize: 12, color: "#829ab1", margin: 0 }}>
                {step === "upload" ? "Upload resume or fill manually" : fileName ? `Parsed from: ${fileName}` : "Manual entry"}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #d9e2ec", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={15} color="#627d98" />
          </button>
        </div>

        {/* Step: Upload */}
        {step === "upload" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Drop zone */}
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #d9e2ec", borderRadius: 16, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s, background 0.2s", background: "#fafbfc" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLDivElement).style.background = "#eff6ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#d9e2ec"; (e.currentTarget as HTMLDivElement).style.background = "#fafbfc"; }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {parsing ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <Loader2 size={32} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ fontSize: 14, color: "#3b82f6", fontWeight: 600, margin: 0 }}>AI is parsing your resume…</p>
                  <p style={{ fontSize: 12, color: "#829ab1", margin: 0 }}>Extracting candidate information</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <Upload size={22} color="#3b82f6" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0a1f33", margin: "0 0 4px" }}>Drop resume here or click to browse</p>
                    <p style={{ fontSize: 12, color: "#829ab1", margin: 0 }}>PDF, DOCX or TXT · AI will auto-fill the form</p>
                  </div>
                </div>
              )}
            </div>

            {parseError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5" }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: 13, color: "#dc2626" }}>{parseError}</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            <button
              onClick={() => setStep("form")}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #d9e2ec", background: "#f8fafc", fontSize: 14, fontWeight: 600, color: "#334e68", cursor: "pointer" }}>
              Fill out manually
            </button>
          </div>
        )}

        {/* Step: Form */}
        {step === "form" && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* AI parsed badge */}
            {fileName && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize: 13, color: "#059669" }}>AI filled the form from <strong>{fileName}</strong> — review and edit below</span>
              </div>
            )}

            {/* Section: Personal */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.07em", margin: "0 0 12px", textTransform: "uppercase" }}>Personal Information</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <FormField label="Full Name *" value={form.fullName} onChange={field("fullName")} placeholder="Sarah Chen" />
                </div>
                <FormField label="Email"    value={form.email}    onChange={field("email")}    placeholder="sarah@example.com" />
                <FormField label="Phone"    value={form.phone}    onChange={field("phone")}    placeholder="+1 555 0000" />
                <FormField label="Location" value={form.location} onChange={field("location")} placeholder="New York, USA" />
              </div>
            </div>

            {/* Section: Professional */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.07em", margin: "0 0 12px", textTransform: "uppercase" }}>Professional</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Job Title"        value={form.jobTitle}        onChange={field("jobTitle")}        placeholder="Senior Frontend Engineer" />
                <FormField label="Current Company"  value={form.currentCompany}  onChange={field("currentCompany")}  placeholder="Acme Corp" />
                <FormField label="Years Experience" value={form.experienceYears} onChange={field("experienceYears")} placeholder="5" type="number" />
                <FormField label="Education"        value={form.education}       onChange={field("education")}       placeholder="B.Sc Computer Science, MIT" />
                <div style={{ gridColumn: "1/-1" }}>
                  <FormField label="Skills (comma separated)" value={form.skills} onChange={field("skills")} placeholder="React, TypeScript, Node.js, AWS" />
                </div>
              </div>
            </div>

            {/* Section: Links */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.07em", margin: "0 0 12px", textTransform: "uppercase" }}>Links</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="LinkedIn URL"   value={form.linkedinUrl}  onChange={field("linkedinUrl")}  placeholder="linkedin.com/in/sarah" />
                <FormField label="Portfolio / GitHub" value={form.portfolioUrl} onChange={field("portfolioUrl")} placeholder="github.com/sarah" />
              </div>
            </div>

            {/* Section: Summary */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#486581", display: "block", marginBottom: 6 }}>Summary</label>
              <textarea
                value={form.summary}
                onChange={field("summary")}
                placeholder="Professional summary…"
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #d9e2ec", fontSize: 13, color: "#334e68", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={e => (e.currentTarget.style.borderColor = "#d9e2ec")}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#486581", display: "block", marginBottom: 6 }}>Recruiter Notes</label>
              <textarea
                value={form.notes}
                onChange={field("notes")}
                placeholder="Internal notes for the hiring team…"
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #d9e2ec", fontSize: 13, color: "#334e68", resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={e => (e.currentTarget.style.borderColor = "#d9e2ec")}
              />
            </div>

            {saveError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5" }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: 13, color: "#dc2626" }}>{saveError}</span>
              </div>
            )}

            {/* Footer actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                onClick={() => { setStep("upload"); setFileName(""); }}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #d9e2ec", background: "#f8fafc", fontSize: 14, fontWeight: 600, color: "#486581", cursor: "pointer" }}>
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: saving ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg,#2563eb,#1d4ed8)", fontSize: 14, fontWeight: 600, color: "#fff", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: saving ? "none" : "0 4px 14px rgba(37,99,235,0.35)" }}>
                {saving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Saving…</> : <><CheckCircle2 size={15} />Save Candidate</>}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ─── Tiny form field helper ───────────────────────────────────────────────────
function FormField({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; placeholder?: string; type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#486581", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #d9e2ec", fontSize: 13, color: "#334e68", outline: "none", boxSizing: "border-box" }}
        onFocus={e => (e.currentTarget.style.borderColor = "#3b82f6")}
        onBlur={e => (e.currentTarget.style.borderColor = "#d9e2ec")}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState<"grid" | "list">("grid");
  const [showDialog, setShowDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCandidates = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/candidates${q ? `?search=${encodeURIComponent(q)}` : ""}`);
      const json = await res.json();
      setCandidates(json.candidates ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchCandidates]);

  function onSaved(c: Candidate) {
    setCandidates(prev => [c, ...prev]);
    setShowDialog(false);
  }

  const filtered = statusFilter === "all"
    ? candidates
    : candidates.filter(c => c.status === statusFilter);

  return (
    <div style={{ padding: "28px 32px", fontFamily: "system-ui,-apple-system,sans-serif", minHeight: "100%" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Candidates</h1>
          <p style={{ fontSize: 14, color: "#627d98", margin: "4px 0 0" }}>
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in your pipeline
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", transition: "transform 0.15s,box-shadow 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(37,99,235,0.4)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
        >
          <Plus size={16} />
          Add Candidate
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 220, background: "#fff", border: "1px solid #d9e2ec", borderRadius: 10, padding: "9px 14px" }}>
          <Search size={14} color="#829ab1" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or title…"
            style={{ border: "none", outline: "none", fontSize: 13, color: "#334e68", width: "100%", background: "transparent" }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ appearance: "none", padding: "9px 32px 9px 12px", borderRadius: 10, border: "1px solid #d9e2ec", fontSize: 13, color: "#334e68", background: "#fff", cursor: "pointer", outline: "none" }}
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_STYLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown size={13} color="#829ab1" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", background: "#f0f4f8", borderRadius: 10, padding: 3, border: "1px solid #d9e2ec" }}>
          {(["grid", "list"] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ width: 34, height: 30, borderRadius: 8, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: viewMode === mode ? "#fff" : "transparent", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
              {mode === "grid" ? <LayoutGrid size={15} color={viewMode === mode ? "#2563eb" : "#829ab1"} /> : <List size={15} color={viewMode === mode ? "#2563eb" : "#829ab1"} />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, gap: 12 }}>
          <Loader2 size={24} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 14, color: "#829ab1" }}>Loading candidates…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#f0f4f8", border: "1.5px dashed #d9e2ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={28} color="#bcccdc" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#486581", margin: "0 0 6px" }}>
              {search ? "No candidates found" : "No candidates yet"}
            </p>
            <p style={{ fontSize: 13, color: "#829ab1", margin: 0 }}>
              {search ? "Try a different search term" : "Click 'Add Candidate' to get started"}
            </p>
          </div>
          {!search && (
            <button onClick={() => setShowDialog(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={16} /> Add First Candidate
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.map(c => <CandidateCard key={c.id} c={c} />)}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #d9e2ec", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(10,31,51,0.05)" }}>
          {/* List header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #f0f4f8" }}>
            <div style={{ width: 38, flexShrink: 0 }} />
            {[["200px","Name / Email"],["180px","Role / Company"],["120px","Location"],["1","Skills"],["auto","Status"],["auto","Added"]].map(([w, label]) => (
              <div key={label} style={{ flex: w === "1" ? 1 : `0 0 ${w}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#829ab1", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
          {filtered.map(c => <CandidateRow key={c.id} c={c} />)}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <AddCandidateDialog onClose={() => setShowDialog(false)} onSaved={onSaved} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}