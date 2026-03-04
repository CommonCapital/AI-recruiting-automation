// app/api/candidates/parse-resume/route.ts
// Receives a resume file (PDF or DOCX), extracts text, sends to Gemini → returns structured JSON

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.0-flash";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF, DOCX, and TXT files are supported" },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // For PDFs Gemini can read directly via inline_data
    // For DOCX we send as binary and ask it to extract text
    const mimeType = file.type === "application/pdf" ? "application/pdf" : "text/plain";

    const prompt = `You are a resume parser. Extract all relevant information from this resume and return ONLY a valid JSON object with no markdown, no backticks, no explanation.

Return exactly this structure (use null for missing fields):
{
  "fullName":        "<full name>",
  "email":           "<email or null>",
  "phone":           "<phone or null>",
  "location":        "<city, country or null>",
  "linkedinUrl":     "<linkedin URL or null>",
  "portfolioUrl":    "<portfolio/github URL or null>",
  "jobTitle":        "<current or most recent job title or null>",
  "currentCompany":  "<current or most recent company or null>",
  "experienceYears": <number of years experience as integer or null>,
  "skills":          ["skill1", "skill2", "..."],
  "education":       "<highest degree + institution or null>",
  "summary":         "<2-3 sentence professional summary based on resume content>"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type === "application/pdf" ? "application/pdf" : "text/plain",
          data: base64,
        },
      },
      prompt,
    ]);

    const raw   = result.response.text().trim()
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      data: parsed,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("[parse-resume]", err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to parse resume" },
      { status: 500 }
    );
  }
}