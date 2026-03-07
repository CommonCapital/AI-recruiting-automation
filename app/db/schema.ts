// app/db/schema.ts
import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  json,
  varchar,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "active",
  "expired",
  "closed",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "freelance",
]);

export const candidateStatusEnum = pgEnum("candidate_status", [
  "pending",
  "invited",
  "in_progress",
  "completed",
  "rejected",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "screening",
  "technical",
  "hr",
]);

export const recommendationEnum = pgEnum("recommendation", [
  "strong_yes",
  "yes",
  "maybe",
  "no",
  "strong_no",
]);

// Jobs table
export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    department: text("department"),
    location: text("location"),
    jobType: jobTypeEnum("job_type").notNull().default("full-time"),
    status: jobStatusEnum("status").notNull().default("draft"),
    description: text("description"),
    requirements: json("requirements"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxJobsStatus: index("idx_jobs_status").on(table.status),
    idxJobsCreatedAt: index("idx_jobs_created_at").on(table.createdAt),
  })
);

// Candidates table
// Candidates table
export const candidates = pgTable(
  "candidates",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    location: text("location"),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    jobTitle: text("job_title"),
    currentCompany: text("current_company"),
    experienceYears: integer("experience_years"),
    skills: json("skills").$type<string[]>(),
    education: text("education"),
    summary: text("summary"),
    notes: text("notes"),
    resumeFileName: text("resume_file_name"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxCandidatesEmail: index("idx_candidates_email").on(table.email),
    idxCandidatesCreatedAt: index("idx_candidates_created_at").on(table.createdAt),
  })
);

// Job Candidates table (many-to-many relationship)
export const jobCandidates = pgTable(
  "job_candidates",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    candidateId: integer("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    status: candidateStatusEnum("status").notNull().default("pending"),
    matchScore: integer("match_score"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxJobCandidatesJobId: index("idx_job_candidates_job_id").on(table.jobId),
    idxJobCandidatesCandidateId: index("idx_job_candidates_candidate_id").on(
      table.candidateId
    ),
    idxJobCandidatesStatus: index("idx_job_candidates_status").on(table.status),
  })
);

// Interviews table
export const interviews = pgTable(
  "interviews",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    candidateId: integer("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    interviewType: interviewTypeEnum("interview_type").notNull(),
    status: candidateStatusEnum("status").notNull().default("pending"),
    durationSeconds: integer("duration_seconds"),
    questionsAnswered: integer("questions_answered"),
    totalQuestions: integer("total_questions"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    idxInterviewsSessionId: index("idx_interviews_session_id").on(
      table.sessionId
    ),
    idxInterviewsCandidateId: index("idx_interviews_candidate_id").on(
      table.candidateId
    ),
    idxInterviewsJobId: index("idx_interviews_job_id").on(table.jobId),
    idxInterviewsStatus: index("idx_interviews_status").on(table.status),
    idxInterviewsCreatedAt: index("idx_interviews_created_at").on(
      table.createdAt
    ),
  })
);

// Interview Summaries table
export const interviewSummaries = pgTable(
  "interview_summaries",
  {
    id: serial("id").primaryKey(),
    interviewId: integer("interview_id")
      .notNull()
      .references(() => interviews.id, { onDelete: "cascade" }),
    overallScore: integer("overall_score").notNull(),
    recommendation: recommendationEnum("recommendation").notNull(),
    headline: text("headline").notNull(),
    strengths: json("strengths").notNull(),
    concerns: json("concerns").notNull(),
    summary: text("summary").notNull(),
    skillScores: json("skill_scores"),
    weaknesses: json("weaknesses"),
    redFlags: json("red_flags"),
    recruiterNotes: text("recruiter_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    idxInterviewSummariesInterviewId: index(
      "idx_interview_summaries_interview_id"
    ).on(table.interviewId),
    idxInterviewSummariesCreatedAt: index(
      "idx_interview_summaries_created_at"
    ).on(table.createdAt),
  })
);

// Company Settings table
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  companySize: text("company_size"),
  defaultJobLocation: text("default_job_location"),
  defaultCurrency: text("default_currency").default("USD"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Interview Settings table
export const interviewSettings = pgTable("interview_settings", {
  id: serial("id").primaryKey(),
  screeningQuestionsCount: integer("screening_questions_count").default(6),
  technicalQuestionsCount: integer("technical_questions_count").default(8),
  hrQuestionsCount: integer("hr_questions_count").default(5),
  maxDurationMinutes: integer("max_duration_minutes").default(30),
  autoEndInterview: boolean("auto_end_interview").default(false),
  allowSkipQuestions: boolean("allow_skip_questions").default(true),
  silenceTimeoutSeconds: integer("silence_timeout_seconds").default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Interview Sessions table (for active sessions)
export const interviewSessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  candidateId: integer("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  interviewType: interviewTypeEnum("interview_type").notNull(),
  status: candidateStatusEnum("status").notNull().default("pending"),
  durationSeconds: integer("duration_seconds"),
  questionsAnswered: integer("questions_answered"),
  totalQuestions: integer("total_questions"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Settings table
export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  interviewerName: text("interviewer_name").default("AI Interviewer"),
  interviewTone: text("interview_tone").default("professional"),
  customSystemPrompt: text("custom_system_prompt"),
  screeningPrompt: text("screening_prompt"),
  technicalPrompt: text("technical_prompt"),
  hrPrompt: text("hr_prompt"),
  closingMessage: text("closing_message").default(
    "Thank you for your time. We will review your responses and get back to you soon."
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email Settings table
export const emailSettings = pgTable("email_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name"),
  companyLogoUrl: text("company_logo_url"),
  emailSenderName: text("email_sender_name"),
  customEmailSubject: text("custom_email_subject"),
  customEmailIntro: text("custom_email_intro"),
  replyToEmail: text("reply_to_email"),
  inviteExpirationDays: integer("invite_expiration_days").default(7),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notification Settings table
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  emailOnInterviewComplete: boolean("email_on_interview_complete").default(
    true
  ),
  notificationEmailAddress: text("notification_email_address"),
  dailyDigest: boolean("daily_digest").default(false),
  lowScoreAlert: boolean("low_score_alert").default(false),
  lowScoreThreshold: integer("low_score_threshold").default(60),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const jobsRelations = relations(jobs, ({ many }) => ({
  jobCandidates: many(jobCandidates),
  interviews: many(interviews),
}));

export const candidatesRelations = relations(candidates, ({ many }) => ({
  jobCandidates: many(jobCandidates),
  interviews: many(interviews),
}));

export const jobCandidatesRelations = relations(jobCandidates, ({ one }) => ({
  job: one(jobs, {
    fields: [jobCandidates.jobId],
    references: [jobs.id],
  }),
  candidate: one(candidates, {
    fields: [jobCandidates.candidateId],
    references: [candidates.id],
  }),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  job: one(jobs, {
    fields: [interviews.jobId],
    references: [jobs.id],
  }),
  candidate: one(candidates, {
    fields: [interviews.candidateId],
    references: [candidates.id],
  }),
  summary: many(interviewSummaries),
}));

export const interviewSummariesRelations = relations(interviewSummaries, ({
  one,
}) => ({
  interview: one(interviews, {
    fields: [interviewSummaries.interviewId],
    references: [interviews.id],
  }),
}));

// Types
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type JobCandidate = typeof jobCandidates.$inferSelect;
export type NewJobCandidate = typeof jobCandidates.$inferInsert;

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

export type InterviewSummary = typeof interviewSummaries.$inferSelect;
export type NewInterviewSummary = typeof interviewSummaries.$inferInsert;

export type CompanySettings = typeof companySettings.$inferSelect;
export type NewCompanySettings = typeof companySettings.$inferInsert;

export type InterviewSettings = typeof interviewSettings.$inferSelect;
export type NewInterviewSettings = typeof interviewSettings.$inferInsert;

export type AiSettings = typeof aiSettings.$inferSelect;
export type NewAiSettings = typeof aiSettings.$inferInsert;

export type EmailSettings = typeof emailSettings.$inferSelect;
export type NewEmailSettings = typeof emailSettings.$inferInsert;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type NewNotificationSettings = typeof notificationSettings.$inferInsert;