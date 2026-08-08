import React from "react";

const integrations = [
  {
    name: "Personal Notebook",
    description: "Your own space to upload, ask, and learn.",
    cta: "Start Free",
    isPrimary: true,
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" // Book open
  },
  {
    name: "Website Widget",
    description: "Drop-in chat bubble for any site.",
    cta: "Get Snippet",
    isPrimary: false,
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" // Chat bubble
  },
  {
    name: "REST API",
    description: "Full programmatic access for custom builds.",
    cta: "View Docs",
    isPrimary: false,
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" // Code brackets
  }
];

export default function IntegrationCards() {
  return (
    <section className="py-24 md:py-32 border-b border-slate-200">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {integrations.map((item, i) => (
            <div 
              key={item.name} 
              className="group flex flex-col p-8 border border-slate-200 bg-paper hover:bg-white transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Preview Icon */}
              <div className="mb-8 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/5 text-slate-900 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>

              {/* Text */}
              <div className="flex-grow mb-12">
                <h3 className="font-display font-medium text-xl text-ink mb-3">
                  {item.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* CTA */}
              <button 
                className={`w-full py-3 text-sm font-medium transition-colors duration-200 text-center ${
                  item.isPrimary 
                    ? "bg-accent text-white hover:bg-orange-600" 
                    : "border border-slate-200 text-slate-900 hover:border-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
