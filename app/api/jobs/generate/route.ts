// app/api/jobs/generate/route.ts
// AI fills entire job posting from just a title

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const prompt = `You are an expert HR recruiter. Generate a complete, professional job posting for the role: "${title}".

Return ONLY a valid JSON object. No markdown, no backticks, no explanation.

Use this exact structure:
{
  "title": "${title}",
  "department": "<department name>",
  "location": "<city, country or 'Remote'>",
  "jobType": "<one of: full_time, part_time, contract, freelance, internship>",
  "remote": <true or false>,
  "salaryMin": <integer in USD, or null>,
  "salaryMax": <integer in USD, or null>,
  "salaryCurrency": "USD",
  "description": "<2-3 paragraph overview of the role and company context>",
  "responsibilities": ["<responsibility 1>", "<responsibility 2>", "<responsibility 3>", "<responsibility 4>", "<responsibility 5>"],
  "requirements": ["<requirement 1>", "<requirement 2>", "<requirement 3>", "<requirement 4>", "<requirement 5>"],
  "niceToHave": ["<nice to have 1>", "<nice to have 2>", "<nice to have 3>"],
  "benefits": ["<benefit 1>", "<benefit 2>", "<benefit 3>", "<benefit 4>"],
  "skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>", "<skill 6>"]
}`;

  try {
    const genAI  = new GoogleGenerativeAI(apiKey);
    const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const raw    = result.response.text().trim()
      .replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim();
    const data   = JSON.parse(raw);
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[job-generate]", err);
    return NextResponse.json({ error: err?.message ?? "Gemini error" }, { status: 500 });
  }
}