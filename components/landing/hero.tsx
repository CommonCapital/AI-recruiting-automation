import {
  ArrowRight,
  Play,
  Users,
  Zap,
  Shield,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50 via-navy-50 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-navy-50 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-50/30 to-transparent rounded-full" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23102a43' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-100 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-navy-700">
                AI-Powered Recruitment Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 leading-[1.1]">
              Hire the{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  best talent
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-blue-100 rounded-sm -z-0" />
              </span>
              <br />
              10x faster with AI
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-navy-500 leading-relaxed max-w-lg">
              Automate screening, eliminate bias, and find perfect candidates in
              minutes — not weeks. Let AI handle the heavy lifting while you
              focus on what matters.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 rounded-2xl shadow-xl shadow-navy-900/25 hover:shadow-navy-900/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Hiring Smarter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-navy-700 bg-white border-2 border-navy-200 hover:border-navy-300 rounded-2xl hover:bg-navy-50 transition-all duration-300"
              >
                <Play className="w-4 h-4 text-blue-500" />
                See How It Works
              </a>
            </div>

            {/* Social proof mini */}
            <div className="mt-10 flex items-center gap-6 text-sm text-navy-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>500+ companies</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>10x faster hiring</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Bias-free AI</span>
              </div>
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative lg:ml-8">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-navy-900/10 border border-navy-100 p-6 lg:p-8">
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">
                      Candidate Pipeline
                    </h3>
                    <p className="text-xs text-navy-400 mt-0.5">
                      Real-time AI screening
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                    Live
                  </div>
                </div>

                {/* Candidate rows */}
                {[
                  {
                    name: "Sarah Chen",
                    role: "Senior Engineer",
                    score: 97,
                    status: "Excellent Match",
                  },
                  {
                    name: "James Wilson",
                    role: "Product Designer",
                    score: 94,
                    status: "Strong Match",
                  },
                  {
                    name: "Maria Garcia",
                    role: "Data Scientist",
                    score: 91,
                    status: "Strong Match",
                  },
                  {
                    name: "Alex Kim",
                    role: "Frontend Dev",
                    score: 88,
                    status: "Good Match",
                  },
                ].map((candidate, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-navy-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-200 to-navy-300 flex items-center justify-center text-xs font-bold text-navy-700">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-navy-400">
                          {candidate.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-navy-900">
                          {candidate.score}%
                        </p>
                        <p className="text-xs text-green-500">
                          {candidate.status}
                        </p>
                      </div>
                      <div
                        className="w-12 h-2 rounded-full bg-navy-100 overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating card - top right */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-navy-900/10 border border-navy-100 p-4 animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-900">
                      AI Screened
                    </p>
                    <p className="text-xs text-navy-400">247 candidates</p>
                  </div>
                </div>
              </div>

              {/* Floating card - bottom left */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl shadow-navy-900/10 border border-navy-100 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-900">
                      Bias Score
                    </p>
                    <p className="text-xs text-green-500 font-medium">
                      0.02% — Excellent
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
