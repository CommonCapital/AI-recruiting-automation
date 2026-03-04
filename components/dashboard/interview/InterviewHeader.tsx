// components/interview/InterviewHeader.tsx

import { Zap, Shield } from "lucide-react";
import Link from "next/link";

export function InterviewHeader() {
  return (
    <header className="w-full border-b border-[#1e3a52] bg-[#0a1628]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex items-center justify-center rounded-[10px] shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
            }}
          >
            <Zap size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <span
              className="font-extrabold tracking-tight"
              style={{ fontSize: 17, color: "#ffffff", letterSpacing: "-0.3px" }}
            >
              Hire<span style={{ color: "#3b82f6" }}>ly</span>
            </span>
            <span
              className="block font-medium"
              style={{ fontSize: 9.5, color: "#4a7fa5", letterSpacing: "0.06em", marginTop: -2 }}
            >
              AI RECRUITMENT
            </span>
          </div>
        </Link>

        {/* Security badge */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#829ab1",
          }}
        >
          <Shield size={12} color="#3b82f6" />
          Secured &amp; encrypted session
        </div>

      </div>
    </header>
  );
}