// app/interview/[interviewId]/layout.tsx
// Minimal public layout — no sidebar, no auth, completely isolated route group

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Invitation | Hirely",
  description: "You have been invited to an AI-powered interview via Hirely.",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Isolated full-page shell — dark themed, no dashboard chrome
    <div
      className="min-h-screen w-full"
      style={{ background: "#070f1a", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}
    >
      {children}
    </div>
  );
}