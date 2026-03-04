import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="text-sm font-medium text-blue-600">
                Powerful Dashboard
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight leading-tight">
              Your entire hiring pipeline,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                one dashboard
              </span>
            </h2>
            <p className="mt-5 text-lg text-navy-500 leading-relaxed">
              Get a bird&apos;s-eye view of every open role, candidate, and
              interview. Real-time analytics help you make data-driven hiring
              decisions.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-5">
              {[
                {
                  icon: TrendingUp,
                  title: "Live Pipeline Tracking",
                  desc: "Monitor candidates through every stage in real-time",
                },
                {
                  icon: BarChart3,
                  title: "Advanced Analytics",
                  desc: "Track time-to-hire, cost-per-hire, and source effectiveness",
                },
                {
                  icon: CheckCircle2,
                  title: "Team Collaboration",
                  desc: "Share feedback, scorecards, and notes with your hiring team",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-navy-900">
                      {item.title}
                    </h4>
                    <p className="text-sm text-navy-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative">
            <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-navy-900/30">
              {/* Dashboard top bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 h-6 rounded-lg bg-navy-700/50" />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  {
                    label: "Open Roles",
                    value: "24",
                    icon: Users,
                    change: "+3",
                  },
                  {
                    label: "Avg. Time to Hire",
                    value: "4.2d",
                    icon: Clock,
                    change: "-62%",
                  },
                  {
                    label: "Hired This Month",
                    value: "18",
                    icon: CheckCircle2,
                    change: "+28%",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-navy-800/50 rounded-2xl p-4 border border-navy-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-4 h-4 text-navy-400" />
                      <span className="text-xs font-medium text-green-400 flex items-center gap-0.5">
                        {stat.change}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-navy-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="bg-navy-800/50 rounded-2xl p-4 border border-navy-700/30 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-navy-300">
                    Hiring Funnel
                  </p>
                  <p className="text-xs text-navy-500">Last 30 days</p>
                </div>
                <div className="flex items-end gap-2 h-32">
                  {[85, 68, 52, 40, 35, 28, 22, 18, 15, 12, 10, 8].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-navy-500">Applied</span>
                  <span className="text-xs text-navy-500">Hired</span>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-navy-800/50 rounded-2xl p-4 border border-navy-700/30">
                <p className="text-sm font-medium text-navy-300 mb-3">
                  Recent Activity
                </p>
                {[
                  "Sarah Chen moved to Final Interview",
                  "AI screened 47 new applications",
                  "Interview scheduled with James Wilson",
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 border-b border-navy-700/20 last:border-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <p className="text-xs text-navy-400">{activity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-navy-500/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
