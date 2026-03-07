// app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Settings, Users, Bot, Mail, Bell, Building, Save, Loader2,
  ChevronRight, ChevronDown, ChevronUp, Plus, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Info, Eye, EyeOff
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompanySettings {
  id?: number;
  companyName: string;
  industry: string;
  companySize: string;
  defaultJobLocation: string;
  defaultCurrency: string;
  timezone: string;
}

interface InterviewSettings {
  id?: number;
  screeningQuestionsCount: number;
  technicalQuestionsCount: number;
  hrQuestionsCount: number;
  maxDurationMinutes: number;
  autoEndInterview: boolean;
  allowSkipQuestions: boolean;
  silenceTimeoutSeconds: number;
}

interface AiSettings {
  id?: number;
  interviewerName: string;
  interviewTone: string;
  customSystemPrompt: string;
  screeningPrompt: string;
  technicalPrompt: string;
  hrPrompt: string;
  closingMessage: string;
}

interface EmailSettings {
  id?: number;
  companyName: string;
  companyLogoUrl: string;
  emailSenderName: string;
  customEmailSubject: string;
  customEmailIntro: string;
  replyToEmail: string;
  inviteExpirationDays: number;
}

interface NotificationSettings {
  id?: number;
  emailOnInterviewComplete: boolean;
  notificationEmailAddress: string;
  dailyDigest: boolean;
  lowScoreAlert: boolean;
  lowScoreThreshold: number;
}

// ─── Helper functions ─────────────────────────────────────────────────────────
const formatCurrency = (code: string) => {
  const currencies: Record<string, string> = {
    USD: "$ US Dollar",
    EUR: "€ Euro",
    GBP: "£ British Pound",
    JPY: "¥ Japanese Yen",
    AUD: "A$ Australian Dollar",
    CAD: "C$ Canadian Dollar",
    CHF: "CHF Swiss Franc",
    CNY: "¥ Chinese Yuan",
    INR: "₹ Indian Rupee",
    BRL: "R$ Brazilian Real"
  };
  return currencies[code] || `${code} Currency`;
};

const formatTimezone = (tz: string) => {
  const zones: Record<string, string> = {
    "UTC": "UTC (Coordinated Universal Time)",
    "America/New_York": "EST/EDT (Eastern Time)",
    "America/Chicago": "CST/CDT (Central Time)",
    "America/Denver": "MST/MDT (Mountain Time)",
    "America/Los_Angeles": "PST/PDT (Pacific Time)",
    "Europe/London": "GMT/BST (London Time)",
    "Europe/Berlin": "CET/CEST (Berlin Time)",
    "Asia/Tokyo": "JST (Tokyo Time)",
    "Asia/Shanghai": "CST (Shanghai Time)",
    "Asia/Dubai": "GST (Dubai Time)",
    "Australia/Sydney": "AEST/AEDT (Sydney Time)"
  };
  return zones[tz] || tz;
};

// ─── Components ───────────────────────────────────────────────────────────────
function TabButton({ 
  id, label, icon: Icon, isActive, onClick 
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? "bg-blue-50 border border-blue-200 text-blue-700" 
          : "hover:bg-gray-50 text-gray-600"
      }`}
      style={{
        border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
        background: isActive ? "#eff6ff" : "transparent"
      }}
    >
      <Icon size={18} />
      <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>
        {label}
      </span>
      {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginLeft: "auto" }} />}
    </button>
  );
}

function SectionHeader({ 
  title, subtitle, icon: Icon 
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#f0f4f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={16} color="#627d98" />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0a1f33", margin: 0 }}>{title}</h2>
          <p style={{ fontSize: 13, color: "#829ab1", margin: "2px 0 0" }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ height: 1, background: "#e5eaf0", marginTop: 12 }} />
    </div>
  );
}

function InputField({ 
  label, value, onChange, type = "text", placeholder, 
  helpText, error, disabled = false 
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
}) {
  const inputProps = {
    value,
    onChange,
    placeholder,
    disabled,
    style: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: error ? "1px solid #ef4444" : "1px solid #e5eaf0",
      background: disabled ? "#f8fafc" : "#fff",
      fontSize: 14,
      color: "#334e68"
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#486581" }}>{label}</span>
        {helpText && (
          <span style={{ fontSize: 11, color: "#829ab1" }}>{helpText}</span>
        )}
      </label>
      {type === "textarea" ? (
        <textarea {...inputProps} rows={3} />
      ) : type === "select" ? (
        <select {...inputProps}>
          {placeholder && <option value="">{placeholder}</option>}
        </select>
      ) : (
        <input {...inputProps} type={type} />
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <AlertCircle size={12} color="#ef4444" />
          <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function ToggleField({ 
  label, checked, onChange, helpText 
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#486581" }}>{label}</span>
        {helpText && (
          <span style={{ fontSize: 11, color: "#829ab1" }}>{helpText}</span>
        )}
      </label>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e5eaf0",
        background: "#fff"
      }}>
        <button
          onClick={() => onChange(!checked)}
          style={{
            width: 40,
            height: 24,
            borderRadius: 99,
            background: checked ? "#3b82f6" : "#e5eaf0",
            position: "relative",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          <div style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
          }} />
        </button>
        <span style={{ fontSize: 13, color: "#627d98" }}>{checked ? "Enabled" : "Disabled"}</span>
      </div>
    </div>
  );
}

function SliderField({ 
  label, value, onChange, min, max, step = 1, unit, helpText 
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  helpText?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#486581" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#829ab1" }}>{value}{unit} • {helpText}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#3b82f6",
          cursor: "pointer"
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#829ab1" }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: "#829ab1" }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Tab Components ───────────────────────────────────────────────────────────
function InterviewSettingsTab({ onSave }: { onSave: (data: InterviewSettings) => void }) {
  const [settings, setSettings] = useState<InterviewSettings>({
    screeningQuestionsCount: 6,
    technicalQuestionsCount: 8,
    hrQuestionsCount: 5,
    maxDurationMinutes: 30,
    autoEndInterview: false,
    allowSkipQuestions: true,
    silenceTimeoutSeconds: 10,
  });

  return (
    <div>
      <SectionHeader title="Interview Settings" subtitle="Control how the AI conducts interviews per type" icon={Bot} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Questions per interview type</h3>
          
          <SliderField
            label="Screening Questions"
            value={settings.screeningQuestionsCount}
            onChange={(v) => setSettings({ ...settings, screeningQuestionsCount: v })}
            min={3}
            max={15}
            unit=""
            helpText="Default: 6"
          />
          
          <SliderField
            label="Technical Questions"
            value={settings.technicalQuestionsCount}
            onChange={(v) => setSettings({ ...settings, technicalQuestionsCount: v })}
            min={5}
            max={20}
            unit=""
            helpText="Default: 8"
          />
          
          <SliderField
            label="HR Questions"
            value={settings.hrQuestionsCount}
            onChange={(v) => setSettings({ ...settings, hrQuestionsCount: v })}
            min={3}
            max={12}
            unit=""
            helpText="Default: 5"
          />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Interview Duration & Behavior</h3>
          
          <SliderField
            label="Max Duration"
            value={settings.maxDurationMinutes}
            onChange={(v) => setSettings({ ...settings, maxDurationMinutes: v })}
            min={10}
            max={60}
            unit=" min"
            helpText="Default: 30"
          />
          
          <ToggleField
            label="Auto-end interview"
            checked={settings.autoEndInterview}
            onChange={(v) => setSettings({ ...settings, autoEndInterview: v })}
            helpText="End call after last question automatically"
          />
          
          <ToggleField
            label="Allow candidate to skip questions"
            checked={settings.allowSkipQuestions}
            onChange={(v) => setSettings({ ...settings, allowSkipQuestions: v })}
          />
          
          <SliderField
            label="Silence timeout"
            value={settings.silenceTimeoutSeconds}
            onChange={(v) => setSettings({ ...settings, silenceTimeoutSeconds: v })}
            min={5}
            max={30}
            unit=" sec"
            helpText="Default: 10"
          />
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSave(settings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Save size={14} />
          <span>Save Interview Settings</span>
        </button>
      </div>
    </div>
  );
}

function AiSettingsTab({ onSave }: { onSave: (data: AiSettings) => void }) {
  const [settings, setSettings] = useState<AiSettings>({
    interviewerName: "AI Interviewer",
    interviewTone: "professional",
    customSystemPrompt: "",
    screeningPrompt: "",
    technicalPrompt: "",
    hrPrompt: "",
    closingMessage: "Thank you for your time. We will review your responses and get back to you soon."
  });

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "conversational", label: "Conversational" }
  ];

  return (
    <div>
      <SectionHeader title="AI Prompt Settings" subtitle="Customize the AI interviewer's behavior" icon={Bot} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Basic Configuration</h3>
          
          <InputField
            label="AI Interviewer Name"
            value={settings.interviewerName}
            onChange={(e) => setSettings({ ...settings, interviewerName: e.target.value })}
            placeholder="e.g., Professional Interviewer"
          />
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#486581", marginBottom: 6 }}>
              Interview Tone
            </label>
            <select
              value={settings.interviewTone}
              onChange={(e) => setSettings({ ...settings, interviewTone: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                background: "#fff",
                fontSize: 14,
                color: "#334e68"
              }}
            >
              {tones.map(tone => (
                <option key={tone.value} value={tone.value}>{tone.label}</option>
              ))}
            </select>
          </div>
          
          <InputField
            label="Closing Message"
            value={settings.closingMessage}
            onChange={(e) => setSettings({ ...settings, closingMessage: e.target.value })}
            placeholder="What the AI says at the end of the interview"
            type="textarea"
          />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Custom Prompts</h3>
          
          <InputField
            label="Custom System Prompt"
            value={settings.customSystemPrompt}
            onChange={(e) => setSettings({ ...settings, customSystemPrompt: e.target.value })}
            placeholder="Override the base AI prompt"
            type="textarea"
            helpText="This will override the default system prompt"
          />
          
          <InputField
            label="Screening Prompt"
            value={settings.screeningPrompt}
            onChange={(e) => setSettings({ ...settings, screeningPrompt: e.target.value })}
            placeholder="Custom instructions for screening interviews"
            type="textarea"
          />
          
          <InputField
            label="Technical Prompt"
            value={settings.technicalPrompt}
            onChange={(e) => setSettings({ ...settings, technicalPrompt: e.target.value })}
            placeholder="Custom instructions for tech interviews"
            type="textarea"
          />
          
          <InputField
            label="HR Prompt"
            value={settings.hrPrompt}
            onChange={(e) => setSettings({ ...settings, hrPrompt: e.target.value })}
            placeholder="Custom instructions for HR/final interviews"
            type="textarea"
          />
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSave(settings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Save size={14} />
          <span>Save AI Settings</span>
        </button>
      </div>
    </div>
  );
}

function EmailSettingsTab({ onSave }: { onSave: (data: EmailSettings) => void }) {
  const [settings, setSettings] = useState<EmailSettings>({
    companyName: "",
    companyLogoUrl: "",
    emailSenderName: "",
    customEmailSubject: "",
    customEmailIntro: "",
    replyToEmail: "",
    inviteExpirationDays: 7
  });

  return (
    <div>
      <SectionHeader title="Email & Invite Settings" subtitle="Reduce recruiter work on email customization" icon={Mail} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Company Information</h3>
          
          <InputField
            label="Company Name"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            placeholder="Used in email templates"
          />
          
          <InputField
            label="Company Logo URL"
            value={settings.companyLogoUrl}
            onChange={(e) => setSettings({ ...settings, companyLogoUrl: e.target.value })}
            placeholder="URL to your company logo"
          />
          
          <InputField
            label="Email Sender Name"
            value={settings.emailSenderName}
            onChange={(e) => setSettings({ ...settings, emailSenderName: e.target.value })}
            placeholder="From display name"
          />
          
          <InputField
            label="Reply-to Email"
            value={settings.replyToEmail}
            onChange={(e) => setSettings({ ...settings, replyToEmail: e.target.value })}
            placeholder="Where candidates can reply"
            type="email"
          />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Email Customization</h3>
          
          <InputField
            label="Custom Email Subject"
            value={settings.customEmailSubject}
            onChange={(e) => setSettings({ ...settings, customEmailSubject: e.target.value })}
            placeholder="Override default subject line"
          />
          
          <InputField
            label="Custom Email Intro"
            value={settings.customEmailIntro}
            onChange={(e) => setSettings({ ...settings, customEmailIntro: e.target.value })}
            placeholder="Personalize the invite email opening"
            type="textarea"
          />
          
          <SliderField
            label="Days until invite expires"
            value={settings.inviteExpirationDays}
            onChange={(v) => setSettings({ ...settings, inviteExpirationDays: v })}
            min={1}
            max={30}
            unit=" days"
            helpText="Auto-note in email"
          />
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSave(settings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Save size={14} />
          <span>Save Email Settings</span>
        </button>
      </div>
    </div>
  );
}

function NotificationSettingsTab({ onSave }: { onSave: (data: NotificationSettings) => void }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailOnInterviewComplete: true,
    notificationEmailAddress: "",
    dailyDigest: false,
    lowScoreAlert: false,
    lowScoreThreshold: 60
  });

  return (
    <div>
      <SectionHeader title="Notifications" subtitle="Configure when and how you get notified" icon={Bell} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Basic Notifications</h3>
          
          <ToggleField
            label="Email on interview complete"
            checked={settings.emailOnInterviewComplete}
            onChange={(v) => setSettings({ ...settings, emailOnInterviewComplete: v })}
          />
          
          <InputField
            label="Notification email address"
            value={settings.notificationEmailAddress}
            onChange={(e) => setSettings({ ...settings, notificationEmailAddress: e.target.value })}
            placeholder="Where to send recruiter notifications"
            type="email"
            disabled={!settings.emailOnInterviewComplete}
          />
          
          <ToggleField
            label="Daily digest"
            checked={settings.dailyDigest}
            onChange={(v) => setSettings({ ...settings, dailyDigest: v })}
            helpText="Daily summary of completed interviews"
          />
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Score-based Alerts</h3>
          
          <ToggleField
            label="Low score alert"
            checked={settings.lowScoreAlert}
            onChange={(v) => setSettings({ ...settings, lowScoreAlert: v })}
            helpText="Alert if candidate scores below threshold"
          />
          
          <SliderField
            label="Low score threshold"
            value={settings.lowScoreThreshold}
            onChange={(v) => setSettings({ ...settings, lowScoreThreshold: v })}
            min={30}
            max={80}
            unit="%"
            helpText="Alert when score is below this percentage"
          />
          
          <div style={{ marginTop: 16, padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Info size={14} color="#c2410c" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#c2410c" }}>Recruiter Time-Savers</span>
            </div>
            <ul style={{ fontSize: 12, color: "#829ab1", margin: 0, paddingLeft: 16 }}>
              <li>Set question counts once - all future interviews use them automatically</li>
              <li>Custom AI prompts - no need to manually configure each interview</li>
              <li>Company info pre-filled - emails go out with correct branding</li>
              <li>Notification alerts - recruiter only checks dashboard when needed</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSave(settings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Save size={14} />
          <span>Save Notification Settings</span>
        </button>
      </div>
    </div>
  );
}

function CompanyProfileTab({ onSave }: { onSave: (data: CompanySettings) => void }) {
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "",
    industry: "",
    companySize: "",
    defaultJobLocation: "",
    defaultCurrency: "USD",
    timezone: "UTC"
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing",
    "Marketing", "Consulting", "Real Estate", "Transportation", "Energy", "Media"
  ];

  const companySizes = [
    "1-10 employees", "11-50 employees", "51-200 employees", 
    "201-500 employees", "501-1000 employees", "1000+ employees"
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BRL"];
  const timezones = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Australia/Sydney"];

  return (
    <div>
      <SectionHeader title="Company Profile" subtitle="Configure your company's basic information" icon={Building} />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Basic Information</h3>
          
          <InputField
            label="Company Name"
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            placeholder="Used across the platform"
          />
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#486581", marginBottom: 6 }}>
              Industry
            </label>
            <select
              value={settings.industry}
              onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                background: "#fff",
                fontSize: 14,
                color: "#334e68"
              }}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#486581", marginBottom: 6 }}>
              Company Size
            </label>
            <select
              value={settings.companySize}
              onChange={(e) => setSettings({ ...settings, companySize: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                background: "#fff",
                fontSize: 14,
                color: "#334e68"
              }}
            >
              <option value="">Select company size</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5eaf0", borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", marginBottom: 12 }}>Default Job Settings</h3>
          
          <InputField
            label="Default Job Location"
            value={settings.defaultJobLocation}
            onChange={(e) => setSettings({ ...settings, defaultJobLocation: e.target.value })}
            placeholder="Pre-fill for new jobs"
          />
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#486581", marginBottom: 6 }}>
              Default Currency
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                background: "#fff",
                fontSize: 14,
                color: "#334e68"
              }}
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{formatCurrency(currency)}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#486581", marginBottom: 6 }}>
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #e5eaf0",
                background: "#fff",
                fontSize: 14,
                color: "#334e68"
              }}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{formatTimezone(tz)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onSave(settings)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <Save size={14} />
          <span>Save Company Profile</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("interview");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "interview", label: "Interview Settings", icon: Bot },
    { id: "ai", label: "AI Prompt Settings", icon: Bot },
    { id: "email", label: "Email & Invite Settings", icon: Mail },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "company", label: "Company Profile", icon: Building }
  ];

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving settings:", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "interview":
        return <InterviewSettingsTab onSave={(data) => handleSave({ type: "interview", data })} />;
      case "ai":
        return <AiSettingsTab onSave={(data) => handleSave({ type: "ai", data })} />;
      case "email":
        return <EmailSettingsTab onSave={(data) => handleSave({ type: "email", data })} />;
      case "notifications":
        return <NotificationSettingsTab onSave={(data) => handleSave({ type: "notifications", data })} />;
      case "company":
        return <CompanyProfileTab onSave={(data) => handleSave({ type: "company", data })} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "24px 28px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0a1f33", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "#829ab1", margin: "3px 0 0" }}>
            Configure your AI recruiting platform settings
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saved && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 99,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0"
            }}>
              <CheckCircle size={14} color="#15803d" />
              <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>Saved</span>
            </div>
          )}
          {saving && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 99,
              background: "#fff7ed",
              border: "1px solid #fed7aa"
            }}>
              <Loader2 size={14} color="#c2410c" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, color: "#c2410c", fontWeight: 600 }}>Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        
        {/* Sidebar */}
        <div style={{
          background: "#fff",
          border: "1px solid #e5eaf0",
          borderRadius: 14,
          padding: 16,
          height: "fit-content"
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#486581", margin: 0, marginBottom: 8 }}>Settings</h3>
            <p style={{ fontSize: 12, color: "#829ab1", margin: 0 }}>Configure platform behavior and preferences</p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 12, background: "#f8fafc", border: "1px solid #e5eaf0", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Info size={14} color="#627d98" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#486581" }}>What Gets Wired</span>
            </div>
            <ul style={{ fontSize: 11, color: "#829ab1", margin: 0, paddingLeft: 16 }}>
              <li>Interview question count → controls AI interview length per type</li>
              <li>Silence timeout → controls how long AI waits for candidate response</li>
              <li>AI prompts → controls what the AI says and how it evaluates</li>
              <li>Closing message → controls what AI says at interview end</li>
              <li>Company info → appears in invite emails</li>
              <li>Email settings → customizes all invite emails</li>
              <li>Notifications → auto-email recruiter when interview completes</li>
              <li>Default job fields → pre-fills location/currency on new jobs</li>
              <li>Timezone → correct time display in schedules</li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}