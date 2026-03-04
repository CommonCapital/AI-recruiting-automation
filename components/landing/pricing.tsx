import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small teams getting started with AI hiring.",
    features: [
      "Up to 5 active job postings",
      "AI candidate screening",
      "Basic analytics dashboard",
      "Email support",
      "500 candidate screenings/mo",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "For growing teams that need advanced AI recruitment tools.",
    features: [
      "Unlimited job postings",
      "Advanced AI matching & ranking",
      "Full analytics & reporting",
      "Automated interview scheduling",
      "Bias detection & reporting",
      "Priority support",
      "5,000 candidate screenings/mo",
      "Team collaboration tools",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with custom recruitment needs.",
    features: [
      "Everything in Professional",
      "Unlimited screenings",
      "Custom AI model training",
      "ATS/HRIS integrations",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom SLA",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <span className="text-sm font-medium text-blue-600">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">
            Plans that{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              scale with you
            </span>
          </h2>
          <p className="mt-5 text-lg text-navy-500 leading-relaxed">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "bg-gradient-to-b from-navy-900 to-navy-950 border-navy-700 shadow-2xl shadow-navy-900/30 scale-105 lg:scale-110"
                  : "bg-white border-navy-100 shadow-sm hover:shadow-xl hover:shadow-navy-900/5"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs font-semibold shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan name */}
              <h3
                className={`text-lg font-semibold mb-2 ${
                  plan.popular ? "text-white" : "text-navy-900"
                }`}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className={`text-4xl lg:text-5xl font-extrabold ${
                    plan.popular ? "text-white" : "text-navy-950"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`text-base ${
                      plan.popular ? "text-navy-300" : "text-navy-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                className={`text-sm mb-8 ${
                  plan.popular ? "text-navy-300" : "text-navy-500"
                }`}
              >
                {plan.description}
              </p>

              {/* CTA */}
              <a
                href="#cta"
                className={`block w-full py-3.5 rounded-2xl text-center text-sm font-semibold transition-all duration-200 mb-8 ${
                  plan.popular
                    ? "bg-white text-navy-900 hover:bg-navy-50 shadow-lg"
                    : "bg-navy-900 text-white hover:bg-navy-800 shadow-lg shadow-navy-900/20"
                }`}
              >
                {plan.cta}
              </a>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? "text-blue-400" : "text-blue-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.popular ? "text-navy-200" : "text-navy-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
