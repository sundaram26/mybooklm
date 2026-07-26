"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  ArrowRight, 
  Sparkles, 
  Upload, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight,
  BookOpen,
  MessageSquare,
  FileText
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreFree: () => void;
}

export function LandingPage({ onOpenAuth, onExploreFree }: LandingPageProps) {
  // Selector state matching Image 3 & 4 dynamic interactive list
  const [activeStep, setActiveStep] = useState<"ingest" | "retrieve" | "chat">("ingest");

  return (
    <div className="h-screen bg-canvas text-text-primary flex flex-col overflow-y-auto scroll-smooth font-sans">
      
      {/* 1. Header matching Image 1 */}
      <header className="px-[60px] py-5 flex items-center justify-between max-w-[1300px] w-full mx-auto shrink-0">
        {/* Brand Name / Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <Image 
            src="/logo-main.png" 
            alt="noetalm logo" 
            width={120} 
            height={28} 
            className="object-contain mix-blend-screen invert"
            priority
          />
        </div>

        {/* Links */}
        <nav className="flex items-center gap-10 text-[0.92rem] font-semibold text-text-primary">
          <a href="#features" className="hover:text-text-secondary transition-colors duration-150 no-underline">Features</a>
          <a href="#how-it-works" className="hover:text-text-secondary transition-colors duration-150 no-underline">How it works</a>
          <a href="#security" className="hover:text-text-secondary transition-colors duration-150 no-underline">Security</a>
          
          <button 
            onClick={onExploreFree}
            className="btn-pill-outline px-6 py-2.5 text-[0.9rem] font-semibold bg-transparent border border-text-primary rounded-full text-text-primary cursor-pointer hover:bg-text-primary hover:text-canvas transition-all duration-150"
          >
            Start for Free
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">

        {/* 2. Hero Section matching Image 1 layout & typography */}
        <section className="max-w-[1300px] mx-auto px-[60px] py-[60px] grid grid-cols-[1.1fr_1fr] gap-[60px] items-center mb-[60px]">
          {/* Left Hero Graphic Illustration - Isometric Vector Style */}
          <div className="relative w-full h-[360px] bg-surface rounded-[28px] border border-border-subtle shadow-sm overflow-hidden flex items-center justify-center">
            {/* Custom stylized vector houses/nodes inspired by Image 1 */}
            <div className="relative w-[300px] h-[300px]">
              {/* Ground Deck */}
              <div className="absolute bottom-[40px] left-[20px] w-[260px] h-[120px] bg-[#D9E2EC] -rotate-[15deg] skew-x-[20deg] rounded-lg border-2 border-[#102A43]" />
              {/* Graphic Card 1 */}
              <div className="absolute bottom-[100px] left-[40px] w-[100px] h-[80px] bg-[#F0B429] -rotate-[15deg] skew-x-[20deg] rounded-[6px] border-2 border-[#102A43] shadow-[4px_4px_0px_rgba(0,0,0,0.15)] flex flex-col p-2 justify-between">
                <div className="h-2 w-10 bg-white rounded-[2px]" />
                <div className="h-1.5 w-[70px] bg-white/60 rounded-[2px]" />
                <div className="h-1.5 w-[50px] bg-white/60 rounded-[2px]" />
              </div>
              {/* Graphic Card 2 */}
              <div className="absolute bottom-[70px] left-[140px] w-[110px] h-[90px] bg-[#e6f4f2] -rotate-[15deg] skew-x-[20deg] rounded-[6px] border-2 border-[#102A43] shadow-[4px_4px_0px_rgba(0,0,0,0.15)] p-2.5 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#0d7a6e] border-2 border-[#102A43]" />
              </div>
              {/* Graphic Foliage */}
              <div className="absolute bottom-[160px] right-[40px] w-[60px] h-[60px] rounded-[50%_50%_0_50%] bg-[#3EAD50] border-2 border-[#102A43]" />
            </div>
            <div className="absolute top-6 left-6 text-[2rem] font-[900] text-text-primary leading-[1.1] max-w-[200px]">
              More than chat
            </div>
          </div>

          {/* Right Hero Content */}
          <div>
            <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.05em] text-accent-blue mb-4">
              Grounded in your sources
            </h2>
            <h1 className="text-[3.2rem] font-[800] leading-[1.1] tracking-[-0.03em] text-text-primary mb-6">
              Electrify your research workflow
            </h1>
            <p className="text-[1.05rem] text-text-secondary leading-[1.65] mb-9">
              noetalm acts as a private, personalized AI partner that parses and synthesizes your custom PDFs, text notes, webpage copies, and image diagrams. By linking answers directly to specific sentences, it delivers 100% verifiable citations without hallucinations.
            </p>

            <button 
              onClick={onExploreFree}
              className="btn-manatee-cta bg-accent-blue text-accent-foreground border-none rounded-full px-7 py-3.5 text-[1.02rem] font-semibold inline-flex items-center gap-3 cursor-pointer hover:bg-accent-blue-hover transition-colors duration-150"
            >
              <span>Get started free</span>
              <div className="w-7 h-7 rounded-full bg-white text-accent-blue flex items-center justify-center">
                <ArrowRight size={16} />
              </div>
            </button>
          </div>
        </section>

        {/* 3. Features Section matching Image 2 Layout */}
        <section id="features" className="px-[60px] py-20 max-w-[1300px] mx-auto">
          <div className="text-center mb-[54px]">
            <h2 className="text-[2.5rem] font-[800] text-text-primary tracking-[-0.03em]">
              Your personal AI research assistant
            </h2>
            <p className="text-[1.02rem] text-text-secondary mt-2">
              Grounded strictly in the documents, notes, and links you trust.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[30px]">
            {/* Card 1 */}
            <div className="bg-surface border border-border-subtle rounded-[28px] px-8 py-10 flex flex-col items-center text-center">
              {/* Graphic Icon */}
              <div className="w-16 h-16 rounded-2xl bg-canvas-subtle flex items-center justify-center text-accent-blue mb-6 border border-border-subtle">
                <Upload size={28} />
              </div>
              <h3 className="text-[1.3rem] font-bold text-text-primary mb-4">
                Source Grounding
              </h3>
              <p className="text-[0.9rem] text-text-secondary leading-[1.6]">
                Upload files (PDFs, DOCX, TXT), paste notes, or insert web links. Responses are strictly grounded in your provided sources, avoiding hallucinations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-surface border border-border-subtle rounded-[28px] px-8 py-10 flex flex-col items-center text-center">
              {/* Graphic Icon */}
              <div className="w-16 h-16 rounded-2xl bg-canvas-subtle flex items-center justify-center text-accent-blue mb-6 border border-border-subtle">
                <Cpu size={28} />
              </div>
              <h3 className="text-[1.3rem] font-bold text-text-primary mb-4">
                Audio Overviews
              </h3>
              <p className="text-[0.9rem] text-text-secondary leading-[1.6]">
                Turn your documents into engaging, podcast-style audio discussions. Listen to two AI hosts break down and synthesize your complex topics on the go.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-surface border border-border-subtle rounded-[28px] px-8 py-10 flex flex-col items-center text-center">
              {/* Graphic Icon */}
              <div className="w-16 h-16 rounded-2xl bg-canvas-subtle flex items-center justify-center text-accent-blue mb-6 border border-border-subtle">
                <Layers size={28} />
              </div>
              <h3 className="text-[1.3rem] font-bold text-text-primary mb-4">
                Inline Citations
              </h3>
              <p className="text-[0.9rem] text-text-secondary leading-[1.6]">
                Every answer includes clickable inline citations, pointing you directly to the exact passage in your source material so you can quickly verify facts.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Interactive Selector Section matching Image 3 & 4 layout */}
        <section id="how-it-works" className="bg-canvas-subtle py-[100px] px-[60px] border-t border-b border-border-subtle">
          <div className="max-w-[1300px] mx-auto">
            <div className="text-center mb-[54px]">
              <button className="px-5 py-2 rounded-full border border-text-primary bg-transparent text-[0.85rem] font-semibold cursor-pointer mb-4">
                How it works
              </button>
              <h2 className="text-[2.4rem] font-[800] text-text-primary tracking-[-0.03em]">
                Verifiable workflow from start to finish
              </h2>
            </div>

            <div className="grid grid-cols-[1.1fr_1fr] gap-[60px] items-center">
              
              {/* Left Column: Visual representation dynamically changing based on activeStep */}
              <div className="bg-surface rounded-[28px] border border-border-subtle p-10 min-h-[380px] flex flex-col justify-start">
                {activeStep === "ingest" && (
                  <div>
                    <h3 className="text-[1.6rem] font-[800] mb-4">Upload Your Knowledge</h3>
                    <p className="text-[0.95rem] text-text-secondary leading-[1.65] mb-6">
                      Simply upload PDFs, Word docs, insert web links or paste your notes. noetalm instantly reads and organizes your specific knowledge base so you can focus on the insights that matter.
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Quick Uploads</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">PDFs & Word Docs</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Web Links</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Text Notes</span>
                    </div>
                  </div>
                )}

                {activeStep === "retrieve" && (
                  <div>
                    <h3 className="text-[1.6rem] font-[800] mb-4">Instant Smart Search</h3>
                    <p className="text-[0.95rem] text-text-secondary leading-[1.65] mb-6">
                      Ask complex questions and let noetalm find the exact answers hidden deep inside your documents. Save hours of manual reading and research.
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Lightning Fast</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Pinpoint Accuracy</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Deep Context</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Saves Hours</span>
                    </div>
                  </div>
                )}

                {activeStep === "chat" && (
                  <div>
                    <h3 className="text-[1.6rem] font-[800] mb-4">Chat & Synthesize</h3>
                    <p className="text-[0.95rem] text-text-secondary leading-[1.65] mb-6">
                      Have a natural conversation with your documents. Brainstorm ideas, draft reports, or generate summaries based 100% on the materials you uploaded.
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Interactive Chat</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Summary Generation</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Idea Brainstorming</span>
                      <span className="px-3 py-1.5 bg-canvas-subtle rounded-sm text-[0.8rem] font-semibold">Verified Facts</span>
                    </div>
                  </div>
                )}

                {/* Isometric Styled Vector Component */}
                <div className="h-[120px] mt-10 w-full bg-canvas-subtle rounded-2xl border border-dashed border-border-medium flex items-center justify-center text-text-muted text-[0.85rem] font-semibold">
                  {activeStep === "ingest" && "📁 Upload your documents into a secure workspace"}
                  {activeStep === "retrieve" && "🔍 Find the exact needle in your document haystack"}
                  {activeStep === "chat" && "💬 Chat naturally with your uploaded knowledge"}
                </div>
              </div>

              {/* Right Column: List of items matching Image 3 & 4 */}
              <div className="flex flex-col gap-5">
                {/* Step 1 Item */}
                <div 
                  onClick={() => setActiveStep("ingest")}
                  className={`p-6 px-[30px] rounded-[24px] cursor-pointer shadow-sm transition-all duration-150 ${activeStep === "ingest" ? "bg-accent-blue-light border-2 border-accent-blue" : "bg-surface border border-border-subtle"}`}
                >
                  <h3 className="text-[1.15rem] font-bold mb-2 text-text-primary">
                    Add Your Sources
                  </h3>
                  <p className="text-[0.85rem] text-text-secondary leading-normal">
                    Bring together your PDFs, notes, and web links into a single, organized notebook.
                  </p>
                </div>

                {/* Step 2 Item */}
                <div 
                  onClick={() => setActiveStep("retrieve")}
                  className={`p-6 px-[30px] rounded-[24px] cursor-pointer shadow-sm transition-all duration-150 ${activeStep === "retrieve" ? "bg-accent-blue-light border-2 border-accent-blue" : "bg-surface border border-border-subtle"}`}
                >
                  <h3 className="text-[1.15rem] font-bold mb-2 text-text-primary">
                    Ask Questions
                  </h3>
                  <p className="text-[0.85rem] text-text-secondary leading-normal">
                    Get instant, accurate answers strictly grounded in the documents you provided.
                  </p>
                </div>

                {/* Step 3 Item */}
                <div 
                  onClick={() => setActiveStep("chat")}
                  className={`p-6 px-[30px] rounded-[24px] cursor-pointer shadow-sm transition-all duration-150 ${activeStep === "chat" ? "bg-accent-blue-light border-2 border-accent-blue" : "bg-surface border border-border-subtle"}`}
                >
                  <h3 className="text-[1.15rem] font-bold mb-2 text-text-primary">
                    Generate Ideas
                  </h3>
                  <p className="text-[0.85rem] text-text-secondary leading-normal">
                    Transform your research into study guides, briefings, outlines, and audio discussions.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Security & Limits Section */}
        <section id="security" className="py-[100px] px-[60px] max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 gap-[60px] items-center">
            <div>
              <h2 className="text-[2.4rem] font-[800] text-text-primary tracking-[-0.03em] mb-5">
                Secure, Private, and Reliable
              </h2>
              <p className="text-[0.98rem] text-text-secondary leading-[1.65] mb-7">
                Your data remains entirely private. We prioritize the security of your documents so you can research with confidence:
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-border-subtle pb-2.5">
                  <span className="font-bold">Data Privacy</span>
                  <span className="text-text-secondary font-medium">Your documents are yours</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2.5">
                  <span className="font-bold">Always Available</span>
                  <span className="text-text-secondary font-medium">Reliable uptime for your work</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2.5">
                  <span className="font-bold">Encrypted Storage</span>
                  <span className="text-text-secondary font-medium">Enterprise-level security</span>
                </div>
              </div>
            </div>

            <div className="bg-canvas-subtle rounded-[28px] p-10 border border-border-subtle flex flex-col items-start">
              <ShieldCheck size={36} className="text-text-primary mb-5" />
              <h3 className="text-[1.4rem] font-[800] mb-4 text-text-primary">
                Frictionless Onboarding
              </h3>
              <p className="text-[0.95rem] text-text-secondary leading-[1.6] mb-6">
                Jump right in and create your first notebook instantly without even creating an account. Once you're ready to save your research and sync across all your devices, simply sign in to unlock your permanent workspace.
              </p>
              <button 
                onClick={onExploreFree}
                className="bg-text-primary text-canvas border-none rounded-full px-5 py-2.5 text-[0.95rem] font-semibold cursor-pointer hover:opacity-85 transition-opacity duration-200"
              >
                Create your first notebook
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* 6. Footer matching Image 1 footer */}
      <footer className="bg-canvas-subtle border-t border-border-subtle px-[60px] py-[60px] shrink-0">
        <div className="max-w-[1300px] mx-auto grid grid-cols-[1.2fr_1fr_1.2fr] gap-[60px]">
          {/* Brand Info */}
          <div>
            <h3 className="text-[1.2rem] font-[800] mb-4">noetalm</h3>
            <p className="text-[0.85rem] text-text-secondary leading-[1.6] max-w-[280px]">
              Your personal AI research assistant. Grounded strictly in the documents, notes, and links you trust.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 text-[0.88rem]">
            <a href="#how-it-works" className="text-inherit no-underline hover:text-text-primary transition-colors duration-150">How it works</a>
            <a href="#features" className="text-inherit no-underline hover:text-text-primary transition-colors duration-150">Platform Features</a>
            <a href="#security" className="text-inherit no-underline hover:text-text-primary transition-colors duration-150">Security & Guest limits</a>
          </div>

          {/* Stay up to date form */}
          <div>
            <h4 className="text-[0.9rem] font-bold mb-4">Stay up to date with everything noetalm</h4>
            <div className="flex items-center bg-surface border border-border-subtle rounded-full p-1 pl-4 justify-between">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="border-none bg-transparent outline-none text-[0.85rem] flex-1 text-text-primary"
              />
              <button 
                onClick={onExploreFree}
                className="w-8 h-8 rounded-full bg-text-primary text-canvas border-none flex items-center justify-center cursor-pointer"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="max-w-[1300px] mx-auto mt-[60px] pt-6 border-t border-border-subtle flex justify-between items-center">
          <p className="text-[0.85rem] text-text-muted">
            © {new Date().getFullYear()} Sundaram Singh. All rights reserved.
          </p>
          <div className="flex gap-5 items-center">
            <a href="https://github.com/Sundaram26/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="https://x.com/sundaram_04" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/sundaram-singh-b5aa4823b/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors duration-150">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
