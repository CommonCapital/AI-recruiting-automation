import { TrendingUp, Clock, Users, Award } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "10x",
    label: "Faster Hiring",
    description: "Compared to traditional methods",
  },
  {
    icon: Clock,
    value: "80%",
    label: "Time Saved",
    description: "On candidate screening",
  },
  {
    icon: Users,
    value: "500+",
    label: "Companies",
    description: "Trust AI Recruiter",
  },
  {
    icon: Award,
    value: "95%",
    label: "Match Accuracy",
    description: "AI-powered precision",
  },
];

export function Stats() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Numbers that speak for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              themselves
            </span>
          </h2>
          <p className="mt-5 text-lg text-navy-300 leading-relaxed">
            Join hundreds of companies already transforming their hiring process
            with AI.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-7 h-7 text-blue-400" />
              </div>
              <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                {stat.value}
              </p>
              <p className="text-lg font-semibold text-white/90 mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-navy-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
