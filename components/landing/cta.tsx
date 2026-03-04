import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section
      id="cta"
      className="py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white/90">
            Start your free 14-day trial
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Ready to transform
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            your hiring?
          </span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-navy-300 leading-relaxed max-w-2xl mx-auto">
          Join 500+ companies already using AI Recruiter to find, screen, and
          hire top talent faster than ever before.
        </p>

        {/* Email signup */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your work email"
            className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm text-sm"
          />
          <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-navy-900 bg-white hover:bg-navy-50 rounded-2xl shadow-xl transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Trust signals */}
        <p className="mt-6 text-sm text-navy-400">
          No credit card required · Free 14-day trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}
