export function Logos() {
  const companies = [
    "TechCorp",
    "InnovateLab",
    "ScaleUp",
    "DataFlow",
    "CloudNine",
    "NextGen",
  ];

  return (
    <section className="py-16 border-y border-navy-100/50 bg-navy-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-navy-400 uppercase tracking-widest mb-10">
          Trusted by 500+ forward-thinking companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {companies.map((company) => (
            <div
              key={company}
              className="flex items-center gap-2 text-navy-300 hover:text-navy-500 transition-colors duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-navy-200/50 flex items-center justify-center">
                <span className="text-xs font-bold text-navy-400">
                  {company[0]}
                </span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
