import {
  Brain,
  Target,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  MessageSquareText,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Screening",
    description:
      "Our AI analyzes resumes, cover letters, and portfolios in seconds — surfacing the most qualified candidates instantly.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Smart Candidate Matching",
    description:
      "Advanced algorithms match candidates to roles based on skills, experience, culture fit, and growth potential.",
    color: "from-navy-700 to-navy-900",
    bgColor: "bg-navy-50",
  },
  {
    icon: CalendarCheck,
    title: "Automated Scheduling",
    description:
      "Eliminate back-and-forth emails. AI coordinates interviews across time zones and calendars automatically.",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track your hiring pipeline with live dashboards. Monitor time-to-hire, cost-per-hire, and conversion rates.",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    icon: ShieldCheck,
    title: "Bias-Free Hiring",
    description:
      "Built-in bias detection ensures fair evaluation. Every candidate is assessed on merit, not demographics.",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: MessageSquareText,
    title: "AI Interview Assistant",
    description:
      "Generate role-specific interview questions, score responses in real-time, and get AI-powered hiring recommendations.",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-sm font-medium text-blue-600">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              hire smarter
            </span>
          </h2>
          <p className="mt-5 text-lg text-navy-500 leading-relaxed">
            From sourcing to onboarding, our AI handles every step of the
            recruitment process with precision and speed.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-3xl bg-white border border-navy-100 hover:border-navy-200 shadow-sm hover:shadow-xl hover:shadow-navy-900/5 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-7 h-7 bg-gradient-to-br ${feature.color} [&>*]:fill-current text-transparent`}
                  style={{
                    color:
                      feature.color.includes("blue")
                        ? "#3b82f6"
                        : feature.color.includes("navy")
                        ? "#102a43"
                        : feature.color.includes("cyan")
                        ? "#06b6d4"
                        : feature.color.includes("violet")
                        ? "#8b5cf6"
                        : feature.color.includes("emerald")
                        ? "#10b981"
                        : "#f59e0b",
                  }}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-navy-500 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient accent */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-navy-50/0 to-blue-50/0 group-hover:from-navy-50/50 group-hover:to-blue-50/30 transition-all duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
