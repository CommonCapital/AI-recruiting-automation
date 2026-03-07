CREATE TYPE "public"."candidate_status" AS ENUM('pending', 'invited', 'in_progress', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('screening', 'technical', 'hr');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'active', 'expired', 'closed');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance');--> statement-breakpoint
CREATE TYPE "public"."recommendation" AS ENUM('strong_yes', 'yes', 'maybe', 'no', 'strong_no');--> statement-breakpoint
CREATE TABLE "ai_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"interviewer_name" text DEFAULT 'AI Interviewer',
	"interview_tone" text DEFAULT 'professional',
	"custom_system_prompt" text,
	"screening_prompt" text,
	"technical_prompt" text,
	"hr_prompt" text,
	"closing_message" text DEFAULT 'Thank you for your time. We will review your responses and get back to you soon.',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"resume" text,
	"skills" json,
	"experience" json,
	"education" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"industry" text,
	"company_size" text,
	"default_job_location" text,
	"default_currency" text DEFAULT 'USD',
	"timezone" text DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text,
	"company_logo_url" text,
	"email_sender_name" text,
	"custom_email_subject" text,
	"custom_email_intro" text,
	"reply_to_email" text,
	"invite_expiration_days" integer DEFAULT 7,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"status" "candidate_status" DEFAULT 'pending' NOT NULL,
	"duration_seconds" integer,
	"questions_answered" integer,
	"total_questions" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interview_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "interview_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"screening_questions_count" integer DEFAULT 6,
	"technical_questions_count" integer DEFAULT 8,
	"hr_questions_count" integer DEFAULT 5,
	"max_duration_minutes" integer DEFAULT 30,
	"auto_end_interview" boolean DEFAULT false,
	"allow_skip_questions" boolean DEFAULT true,
	"silence_timeout_seconds" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" integer NOT NULL,
	"overall_score" integer NOT NULL,
	"recommendation" "recommendation" NOT NULL,
	"headline" text NOT NULL,
	"strengths" json NOT NULL,
	"concerns" json NOT NULL,
	"summary" text NOT NULL,
	"skill_scores" json,
	"weaknesses" json,
	"red_flags" json,
	"recruiter_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"status" "candidate_status" DEFAULT 'pending' NOT NULL,
	"duration_seconds" integer,
	"questions_answered" integer,
	"total_questions" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interviews_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "job_candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"candidate_id" integer NOT NULL,
	"status" "candidate_status" DEFAULT 'pending' NOT NULL,
	"match_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"department" text,
	"location" text,
	"job_type" "job_type" DEFAULT 'full-time' NOT NULL,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"description" text,
	"requirements" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_on_interview_complete" boolean DEFAULT true,
	"notification_email_address" text,
	"daily_digest" boolean DEFAULT false,
	"low_score_alert" boolean DEFAULT false,
	"low_score_threshold" integer DEFAULT 60,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_summaries" ADD CONSTRAINT "interview_summaries_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_candidates" ADD CONSTRAINT "job_candidates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_candidates" ADD CONSTRAINT "job_candidates_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_candidates_email" ON "candidates" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_candidates_created_at" ON "candidates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_interview_summaries_interview_id" ON "interview_summaries" USING btree ("interview_id");--> statement-breakpoint
CREATE INDEX "idx_interview_summaries_created_at" ON "interview_summaries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_interviews_session_id" ON "interviews" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_interviews_candidate_id" ON "interviews" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "idx_interviews_job_id" ON "interviews" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_interviews_status" ON "interviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_interviews_created_at" ON "interviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_job_candidates_job_id" ON "job_candidates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "idx_job_candidates_candidate_id" ON "job_candidates" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX "idx_job_candidates_status" ON "job_candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_jobs_status" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_jobs_created_at" ON "jobs" USING btree ("created_at");