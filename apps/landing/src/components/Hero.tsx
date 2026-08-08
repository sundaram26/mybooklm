import React from "react";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden border-b border-slate-200 py-24 md:py-32">
      {/* Ghost Wordmark - increased opacity for better visibility */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <h1 className="text-[25vw] font-display font-bold text-slate-900/10 whitespace-nowrap tracking-tighter mix-blend-multiply md:translate-y-12 will-change-transform motion-safe:animate-[parallax_10s_ease-in-out_infinite_alternate]">
          NOETALM
        </h1>
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        {/* Top Header Area: Eyebrow + Supporting Text */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 mb-12 animate-fade-in-up">
          <div className="font-mono text-sm tracking-widest text-slate-500 uppercase">
            [ Your Second Brain, Built From Your Own Notes ]
          </div>
          <p className="text-slate-500 text-sm md:text-base max-w-sm md:text-right leading-relaxed">
            Upload your notes, PDFs, or research. Noetalm reads them, quizzes you on them, maps out what to learn next, and can explain any of it back in plain language — instantly.
          </p>
        </div>

        {/* Main Headline */}
        <div className="mb-20 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="font-display font-medium text-4xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-ink text-balance max-w-4xl">
            Turn Any Notes Into An Assistant That <br className="hidden md:block" />
            Actually Knows Them
          </h2>
        </div>

        {/* Central Visual: Product Mockup */}
        <div className="relative w-full max-w-5xl mx-auto py-12 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="relative z-10 w-full aspect-[16/9] md:aspect-[21/9] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* App Header/Toolbar */}
            <div className="h-10 border-b border-slate-200 bg-paper flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
            </div>
            
            {/* App Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Document/Notes Panel */}
              <div className="w-1/3 border-r border-slate-200 bg-paper/50 p-6 hidden sm:flex flex-col gap-4">
                <div className="h-6 w-3/4 bg-slate-200 rounded-sm mb-4" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-slate-200 rounded-sm" />
                  <div className="h-3 w-full bg-slate-200 rounded-sm" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded-sm" />
                  <div className="h-3 w-full bg-slate-200 rounded-sm" />
                  <div className="h-3 w-4/5 bg-slate-200 rounded-sm" />
                </div>
                <div className="mt-8 h-4 w-1/2 bg-slate-200 rounded-sm mb-2" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-slate-200 rounded-sm" />
                  <div className="h-3 w-11/12 bg-slate-200 rounded-sm" />
                  <div className="h-3 w-full bg-slate-200 rounded-sm" />
                </div>
              </div>
              
              {/* Chat/Assistant Panel */}
              <div className="flex-1 bg-white p-6 md:p-8 flex flex-col justify-end gap-6 relative">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-paper border border-slate-200 text-slate-500 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                    Can you summarize the key findings from chapter 3?
                  </div>
                </div>
                
                {/* AI Assistant Message */}
                <div className="flex justify-start">
                  <div className="bg-slate-900 text-white text-sm px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md">
                    <p className="mb-2">Based on your uploaded notes, here are the key findings:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>The primary mechanism relies on adaptive learning rates. <span className="text-accent opacity-80 text-xs ml-1">[1]</span></li>
                      <li>Efficiency improved by 40% over baseline models. <span className="text-accent opacity-80 text-xs ml-1">[2]</span></li>
                    </ul>
                  </div>
                </div>
                
                {/* Peek-in Quiz Card (Overlay) */}
                <div className="absolute right-8 bottom-24 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-4 transform rotate-2 hidden md:block">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pop Quiz</span>
                  </div>
                  <p className="text-sm text-ink font-medium mb-4">What was the efficiency improvement?</p>
                  <div className="space-y-2">
                    <div className="h-8 border border-slate-200 rounded px-3 flex items-center hover:bg-paper cursor-pointer transition-colors">
                      <span className="text-xs text-slate-500">A. 20%</span>
                    </div>
                    <div className="h-8 border border-accent/30 bg-accent/5 rounded px-3 flex items-center cursor-pointer">
                      <span className="text-xs text-accent font-medium">B. 40%</span>
                    </div>
                  </div>
                </div>
                
                {/* Input Area (Mock) */}
                <div className="h-12 border border-slate-200 rounded-full flex items-center px-4 mt-2 bg-paper/50">
                  <div className="h-4 w-1/3 bg-slate-300 rounded-sm" />
                  <div className="ml-auto w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floor Reflection Gradient */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-t from-slate-200/40 to-transparent blur-2xl -z-10" />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
          <button className="px-8 py-4 bg-accent text-white font-medium text-sm hover:bg-orange-600 transition-colors duration-200 w-full sm:w-auto shadow-sm">
            Start Free
          </button>
          <button className="px-8 py-4 border border-slate-200 text-slate-900 font-medium text-sm hover:border-slate-900 hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto shadow-sm">
            Watch It Work
          </button>
        </div>
      </div>
    </section>
  );
}
