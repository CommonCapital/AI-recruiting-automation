import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Emily Rodriguez",
    role: "VP of People",
    company: "TechCorp",
    quote:
      "AI Recruiter cut our time-to-hire from 45 days to just 8. The quality of candidates has never been higher. It's like having a team of expert recruiters working 24/7.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Head of Talent",
    company: "ScaleUp Inc.",
    quote:
      "The bias-free screening is a game-changer. We've seen a 40% increase in diversity hires while maintaining the highest quality bar. Truly revolutionary technology.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "CEO",
    company: "InnovateLab",
    quote:
      "We went from spending $15,000 per hire to under $2,000. The ROI was immediate and the platform practically runs itself. Best investment we've made this year.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-gradient-to-b from-white to-navy-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-100 mb-6">
            <span className="text-sm font-medium text-navy-700">
              Customer Stories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              hiring teams
            </span>{" "}
            everywhere
          </h2>
          <p className="mt-5 text-lg text-navy-500 leading-relaxed">
            See why hundreds of companies trust AI Recruiter to find their next
            great hire.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="relative p-8 rounded-3xl bg-white border border-navy-100 shadow-sm hover:shadow-xl hover:shadow-navy-900/5 transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Quote icon */}
              <div className="mb-6">
                <Quote className="w-10 h-10 text-navy-100 group-hover:text-blue-100 transition-colors" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-navy-600 leading-relaxed mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-navy-50">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy-200 to-navy-300 flex items-center justify-center">
                  <span className="text-sm font-bold text-navy-700">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-navy-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
