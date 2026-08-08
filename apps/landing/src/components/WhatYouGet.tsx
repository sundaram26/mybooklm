import React from "react";

export default function WhatYouGet() {
  return (
    <section className="py-24 md:py-32 border-b border-slate-200 bg-paper">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-12">
          
          {/* Feature 1: Ask Anything */}
          <div className="flex flex-col group animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="h-64 mb-8 relative rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-end p-4 transition-shadow duration-300 group-hover:shadow-md">
              {/* Subtle background grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="self-end bg-paper border border-slate-200 text-slate-500 text-xs px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                  Explain the central thesis.
                </div>
                <div className="self-start bg-slate-900 text-white text-xs px-3 py-2 rounded-2xl rounded-tl-sm max-w-[90%] shadow-md">
                  <p className="mb-1">The central thesis argues that...</p>
                  <div className="bg-slate-800 rounded px-2 py-1 mt-2 text-[10px] text-slate-300 border border-slate-700/50 flex items-center gap-1">
                    <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Source: Chapter 1, Paragraph 3
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-display font-medium text-2xl text-ink mb-4">Ask Anything</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              Ask a question, get an answer sourced straight from your own material — with the exact passage it came from.
            </p>
          </div>

          {/* Feature 2: Test Yourself */}
          <div className="flex flex-col group animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div className="h-64 mb-8 relative rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center p-6 transition-shadow duration-300 group-hover:shadow-md">
              <div className="w-full bg-paper border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-accent">Q1</span>
                  </div>
                  <div className="h-2 flex-grow bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-accent" />
                  </div>
                </div>
                <div className="h-3 w-5/6 bg-slate-300 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-8 border border-slate-200 bg-white rounded px-3 flex items-center">
                    <div className="w-3 h-3 rounded-full border border-slate-300 mr-2" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                  </div>
                  <div className="h-8 border border-accent/40 bg-accent/5 rounded px-3 flex items-center">
                    <div className="w-3 h-3 rounded-full border-[3px] border-accent mr-2" />
                    <div className="h-2 w-2/3 bg-accent/60 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-display font-medium text-2xl text-ink mb-4">Test Yourself</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              Auto-generated quizzes from whatever you upload, so reading turns into actually remembering.
            </p>
          </div>

          {/* Feature 3: See The Path */}
          <div className="flex flex-col group animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="h-64 mb-8 relative rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center p-8 transition-shadow duration-300 group-hover:shadow-md">
              <div className="relative w-full h-full">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200" />
                
                {/* Timeline Nodes */}
                <div className="absolute top-4 left-0 w-full flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border-4 border-white shadow-sm relative z-10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 mt-1">
                    <div className="h-3 w-1/2 bg-slate-900 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                  </div>
                </div>

                <div className="absolute top-20 left-0 w-full flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-accent border-4 border-white shadow-sm relative z-10 animate-pulse" />
                  <div className="flex-1 mt-1">
                    <div className="h-3 w-2/3 bg-accent rounded mb-2" />
                    <div className="h-2 w-full bg-slate-200 rounded" />
                  </div>
                </div>

                <div className="absolute top-36 left-0 w-full flex items-start gap-4 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-slate-300 border-4 border-white shadow-sm relative z-10" />
                  <div className="flex-1 mt-1">
                    <div className="h-3 w-1/3 bg-slate-300 rounded mb-2" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-display font-medium text-2xl text-ink mb-4">See The Path</h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              A visual roadmap of what to learn next, built from the gaps in what you've already covered.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
