import React from "react";

const specs = [
  { label: "Auth", value: "API key or OAuth2" },
  { label: "p95 Latency", value: "< 400ms", isMono: true },
  { label: "Model routing", value: "swap providers per workspace" },
  { label: "Data residency", value: "region-pinned storage" },
  { label: "Rate limits", value: "tiered by plan" },
  { label: "Uptime SLA", value: "99.9%", isMono: true },
];

export default function SpecsGrid() {
  return (
    <section className="py-24 md:py-32 border-b border-slate-200 bg-paper">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Header Area */}
          <div className="lg:col-span-5 animate-fade-in-up">
            <div className="font-mono text-sm tracking-widest text-slate-500 uppercase mb-6">
              [ For Teams & Developers ]
            </div>
            <h2 className="font-display font-medium text-3xl md:text-4xl leading-tight text-ink mb-6 text-balance">
              Built For Real Integration — Matched To Your Stack
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              Every parameter is tested for production use: auth, latency, data residency, and rate limits — so integration decisions are never a guess.
            </p>
          </div>

          {/* Grid Area */}
          <div className="lg:col-span-7 w-full border-t border-slate-200 lg:border-t-0">
            <div className="flex flex-col">
              {specs.map((spec, i) => (
                <div 
                  key={spec.label} 
                  className="flex items-center justify-between py-5 border-b border-slate-200 group animate-fade-in-up hover:bg-slate-50/50 transition-colors"
                  style={{ animationDelay: `${(i + 1) * 50}ms` }}
                >
                  <span className="text-sm text-slate-500 font-medium">{spec.label}</span>
                  {/* Dotted connecting line for visual rhythm (hidden on mobile, visible md+) */}
                  <div className="hidden md:block flex-grow mx-6 border-b border-dotted border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`text-ink text-right ${spec.isMono ? 'font-mono text-base' : 'font-medium text-sm md:text-base'}`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
