import { Upload, Cpu, UserCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Post Your Job",
    description:
      "Create a job listing in minutes. Our AI helps you write compelling, inclusive job descriptions that attract top talent.",
    detail: "Average time: 3 minutes",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Screens & Ranks",
    description:
      "Our AI instantly analyzes every application, scoring candidates on skills, experience, and culture fit — completely bias-free.",
    detail: "Screens 1,000+ resumes in seconds",
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Hire Top Talent",
    description:
      "Review AI-ranked candidates, conduct smart interviews with AI assistance, and make confident hiring decisions faster than ever.",
    detail: "Reduce time-to-hire by 80%",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 lg:py-32 bg-gradient-to-b from-navy-50/50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-100 border border-navy-200 mb-6">
            <span className="text-sm font-medium text-navy-700">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">
            Three steps to your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              perfect hire
            </span>
          </h2>
          <p className="mt-5 text-lg text-navy-500 leading-relaxed">
            No complex setup. No learning curve. Just results.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-navy-200 via-blue-300 to-navy-200" />

          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="text-center">
                {/* Step number circle */}
                <div className="relative inline-flex mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-xl shadow-navy-900/20 relative z-10">
                    <step.icon className="w-9 h-9 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg z-20">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-navy-500 leading-relaxed mb-4 max-w-sm mx-auto">
                  {step.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500">
                  {step.detail}
                </span>
              </div>

              {/* Arrow between steps (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-24 -right-3 z-30">
                  <ArrowRight className="w-6 h-6 text-navy-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
