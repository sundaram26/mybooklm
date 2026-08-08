import React from "react";

const advantages = [
  {
    number: "01",
    title: "Embed Anywhere",
    description: "One snippet drops a fully grounded chat assistant into any site or internal tool, bringing your assistant directly to your users.",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" // Code brackets
  },
  {
    number: "02",
    title: "Brand-Matched Output",
    description: "Noetalm reads color, type, and tone straight from your own documents and applies it to every generated widget, deck, and brief.",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" // Color swatch/palette vibe
  },
  {
    number: "03",
    title: "Source-Verified Answers",
    description: "Every claim links back to the exact paragraph it came from, and conflicting sources are flagged instead of silently blended.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" // Shield check
  }
];

export default function AdvantageCards() {
  return (
    <section className="py-24 md:py-32 border-b border-slate-200">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Bridge Header */}
        <div className="max-w-2xl mb-20 animate-fade-in-up">
          <div className="font-mono text-sm tracking-widest text-slate-500 uppercase mb-6">
            [ From Personal To Team ]
          </div>
          <h2 className="font-display font-medium text-3xl md:text-5xl leading-tight text-ink mb-6 text-balance">
            What Starts As Your Notebook Can Become Everyone's
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Once your notebook knows your material, you can hand it to your team, drop it into your product, or give it to your students — and it keeps the same source-accuracy, just wearing your brand instead of ours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
          {advantages.map((adv, i) => (
            <div 
              key={adv.number} 
              className="relative flex flex-col group animate-fade-in-up" 
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Background faint icon */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 text-slate-900 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:opacity-10">
                <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={adv.icon} />
                </svg>
              </div>

              <div className="flex items-baseline gap-4 mb-6 relative z-10">
                <span className="font-mono text-sm tracking-widest text-accent">
                  {adv.number}
                </span>
                <div className="h-px bg-slate-200 flex-grow" />
              </div>

              <h3 className="font-display font-medium text-xl text-ink mb-4 relative z-10">
                {adv.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed relative z-10 text-sm md:text-base">
                {adv.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
