// hooks/useInterviewSession.ts  (updated — adds transcript persistence + summary)

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InterviewSummary, TranscriptMessage } from "@/app/db/schema";

export interface Message {
  id:        string;
  role:      "ai" | "user";
  content:   string;
  timestamp: Date;
}

export type InterviewPhase =
  | "idle"
  | "ai-thinking"
  | "ai-speaking"
  | "user-speaking"
  | "processing"
  | "saving"          // new: uploading transcript
  | "ended";

interface UseInterviewSessionOptions {
  interviewId:      string;
  candidateName:    string;
  candidateEmail?:  string;
  jobTitle:         string;
  jobDescription?:  string;
  totalQuestions?:  number;
}

export function useInterviewSession({
  interviewId,
  candidateName,
  candidateEmail,
  jobTitle,
  jobDescription = "",
  totalQuestions = 7,
}: UseInterviewSessionOptions) {
  const [messages, setMessages]             = useState<Message[]>([]);
  const [phase, setPhase]                   = useState<InterviewPhase>("idle");
  const [questionIndex, setQuestionIndex]   = useState(0);
  const [isMuted, setIsMuted]               = useState(false);
  const [isCameraOn, setIsCameraOn]         = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError]                   = useState<string | null>(null);
  const [summary, setSummary]               = useState<InterviewSummary | null>(null);
  const [sessionId, setSessionId]           = useState<string | null>(null);

  // Refs
  const audioCtxRef      = useRef<AudioContext | null>(null);
  const recognitionRef   = useRef<SpeechRecognition | null>(null);
  const historyRef       = useRef<TranscriptMessage[]>([]);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMutedRef       = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef     = useRef<Date | null>(null);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  function startTimer() {
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // ── Add message ───────────────────────────────────────────────────────────
  function addMessage(role: "ai" | "user", content: string) {
    const ts = new Date();
    const msg: Message = { id: `${role}-${Date.now()}`, role, content, timestamp: ts };
    setMessages((prev) => [...prev, msg]);
    historyRef.current.push({ role, content, timestamp: ts.toISOString() });
  }

  // ── TTS via Murf Falcon ───────────────────────────────────────────────────
  async function playAudioStream(text: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        const ctx = audioCtxRef.current;

        const res = await fetch("/api/interview/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId: "Matthew" }),
        });
        if (!res.ok) throw new Error("TTS failed");

        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        currentSourceRef.current?.stop();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => resolve();
        source.start();
        currentSourceRef.current = source;
      } catch (e) { reject(e); }
    });
  }

  // ── STT ───────────────────────────────────────────────────────────────────
  function listenForUserResponse(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { reject(new Error("Speech recognition not supported.")); return; }

      const recognition: SpeechRecognition = new SR();
      recognitionRef.current = recognition;
      recognition.lang           = "en-US";
      recognition.continuous     = false;
      recognition.interimResults = false;

      let transcript = "";
      recognition.onresult = (e) => { transcript = e.results[0][0].transcript; };
      recognition.onend    = () => resolve(transcript || "[No response detected]");
      recognition.onerror  = (e) => {
        if (e.error === "no-speech") resolve("[No response detected]");
        else reject(new Error(`Speech error: ${e.error}`));
      };

      isMutedRef.current ? setTimeout(() => resolve("[Microphone muted]"), 8000) : recognition.start();
    });
  }

  // ── Save transcript + generate summary ───────────────────────────────────
  const saveAndSummarize = useCallback(async (
    finalTranscript: TranscriptMessage[],
    questionsAnswered: number,
    durationSecs: number
  ) => {
    setPhase("saving");
    try {
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId:        sessionId ?? undefined,
          interviewId,
          candidateName,
          candidateEmail,
          jobTitle,
          jobDescription,
          transcript:       finalTranscript,
          durationSeconds:  durationSecs,
          questionsAnswered,
          totalQuestions,
        }),
      });

      if (!res.ok) throw new Error("Failed to save interview");
      const data = await res.json();

      setSessionId(data.sessionId);
      setSummary(data.summary as InterviewSummary);
      setPhase("ended");
    } catch (e: any) {
      setError(e.message ?? "Failed to save interview.");
      setPhase("ended");
    }
  }, [interviewId, candidateName, candidateEmail, jobTitle, jobDescription, totalQuestions, sessionId]);

  // ── Single turn ───────────────────────────────────────────────────────────
  const runTurn = useCallback(async (index: number) => {
    try {
      setPhase("ai-thinking");

      const qRes = await fetch("/api/interview/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle, jobDescription,
          history: historyRef.current,
          questionIndex: index,
          totalQuestions,
        }),
      });
      const { question } = await qRes.json();

      addMessage("ai", question);
      setPhase("ai-speaking");
      await playAudioStream(question);

      // Last turn (closing) — save immediately
      if (index >= totalQuestions - 1) {
        stopTimer();
        const elapsed = startTimeRef.current
          ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)
          : 0;
        const userAnswers = historyRef.current.filter((m) => m.role === "user").length;
        await saveAndSummarize(historyRef.current, userAnswers, elapsed);
        return;
      }

      setPhase("user-speaking");
      const userAnswer = await listenForUserResponse();
      addMessage("user", userAnswer);
      setQuestionIndex(index + 1);

      setPhase("processing");
      await runTurn(index + 1);
    } catch (e: any) {
      setError(e.message ?? "An error occurred.");
      stopTimer();
      setPhase("ended");
    }
  }, [jobTitle, jobDescription, totalQuestions, saveAndSummarize]);

  // ── Start ─────────────────────────────────────────────────────────────────
  const startInterview = useCallback(async () => {
    setPhase("ai-thinking");
    startTimer();
    await runTurn(0);
  }, [runTurn]);

  // ── End early ─────────────────────────────────────────────────────────────
  const endInterview = useCallback(async () => {
    recognitionRef.current?.abort();
    currentSourceRef.current?.stop();
    stopTimer();

    const elapsed = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)
      : 0;
    const userAnswers = historyRef.current.filter((m) => m.role === "user").length;

    if (historyRef.current.length > 0) {
      await saveAndSummarize(historyRef.current, userAnswers, elapsed);
    } else {
      setPhase("ended");
    }
  }, [saveAndSummarize]);

  const toggleMute   = useCallback(() => {
    setIsMuted((prev) => { if (!prev) recognitionRef.current?.abort(); return !prev; });
  }, []);
  const toggleCamera = useCallback(() => setIsCameraOn((p) => !p), []);

  useEffect(() => () => {
    stopTimer();
    recognitionRef.current?.abort();
    currentSourceRef.current?.stop();
    audioCtxRef.current?.close();
  }, []);

  return {
    messages, phase, questionIndex, totalQuestions,
    isMuted, isCameraOn, elapsedSeconds, error, summary,
    startInterview, endInterview, toggleMute, toggleCamera,
  };
}