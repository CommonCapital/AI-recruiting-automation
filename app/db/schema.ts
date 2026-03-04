import { integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

// ─── Enums ────────────────────────────────────────────────────────────────────
export const interviewStatusEnum = pgEnum("interview_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const recommendationEnum = pgEnum("recommendation", [
  "strong_yes",
  "yes",
  "maybe",
  "no",
  "strong_no",
]);

// ─── Interview Sessions ───────────────────────────────────────────────────────
// One row per candidate × interview link click
export const interviewSessions = pgTable("interview_sessions", {
  id:               uuid("id").defaultRandom().primaryKey(),

  // Link back to your existing emailInvites / jobs tables
  interviewId:     text("interview_id").notNull(),       // the [interviewId] URL param
  candidateName:   text("candidate_name").notNull(),
  candidateEmail:  text("candidate_email"),

  jobTitle:        text("job_title").notNull(),
  jobDescription:  text("job_description"),

  status:          interviewStatusEnum("status").notNull().default("in_progress"),

  // Full Q&A transcript stored as JSONB array
  // Shape: { role: "ai"|"user", content: string, timestamp: string }[]
  transcript:      jsonb("transcript").$type<TranscriptMessage[]>().notNull().default([]),

  // Total questions asked
  totalQuestions:  integer("total_questions").notNull().default(7),
  questionsAnswered: integer("questions_answered").notNull().default(0),

  // Duration in seconds
  durationSeconds: integer("duration_seconds"),

  // Gemini-generated summary (populated on completion)
  summary:         jsonb("summary").$type<InterviewSummary | null>().default(null),

  startedAt:       timestamp("started_at").defaultNow().notNull(),
  completedAt:     timestamp("completed_at"),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TranscriptMessage {
  role:      "ai" | "user";
  content:   string;
  timestamp: string; // ISO string
}

export interface SkillScore {
  skill:    string;   // e.g. "Communication", "Technical Knowledge"
  score:    number;   // 1–10
  rationale: string;
}

export interface InterviewSummary {
  overallScore:      number;           // 0–100
  recommendation:    "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
  recommendationLabel: string;         // Human-readable
  headline:          string;           // One-line summary
  strengths:         string[];         // 3–5 bullet points
  weaknesses:        string[];         // 2–4 bullet points
  skillScores:       SkillScore[];     // Per-skill breakdown
  recruiterNotes:    string;           // 2–3 paragraph narrative for recruiter
  redFlags:          string[];         // Any concerns (empty array if none)
  generatedAt:       string;           // ISO timestamp
}
