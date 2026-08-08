import React from "react";

export default function FooterCta() {
  return (
    <footer className="py-24 md:py-32 bg-paper overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl flex flex-col items-center text-center animate-fade-in-up">
        {/* Subtle decorative line */}
        <div className="w-px h-16 bg-gradient-to-b from-transparent to-slate-200 mb-12" />
        
        <h2 className="font-display font-medium text-3xl md:text-4xl text-ink mb-8 max-w-lg text-balance tracking-tight">
          Start With Your Notes. Scale To Your Team.
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button className="px-8 py-4 bg-ink text-white font-medium text-sm hover:bg-slate-800 transition-colors duration-200 w-full sm:w-auto shadow-sm">
            Start Free
          </button>
          <button className="px-8 py-4 border border-slate-300 text-slate-700 font-medium text-sm hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto">
            Talk To Us About Embedding
          </button>
        </div>
        
        <div className="mt-24 text-sm text-slate-500 font-mono tracking-widest uppercase">
          © {new Date().getFullYear()} Noetalm
        </div>
      </div>
    </footer>
  );
}
