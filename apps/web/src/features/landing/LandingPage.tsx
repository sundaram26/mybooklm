"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Upload,
  Cpu,
  ShieldCheck,
  Layers,
  Play,
  FileText,
  Bot,
  Network,
  Key,
  Database,
  Lock,
  Clock,
  Check,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  ExternalLink,
  Shield,
  Zap,
  Users,
  Sun,
  Moon
} from "lucide-react";

import { useWorkspaceStore } from "../../store/workspaceStore";
import { useTheme } from "../../components/theme-provider";

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { setAuthModalOpen, setViewMode } = useWorkspaceStore();
  const handleOpenAuth = () => setAuthModalOpen(true);
  const handleExploreFree = () => setViewMode("app");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Active step for the step-by-step interactive showcase
  const [activeStep, setActiveStep] = useState<"ingest" | "search" | "chat">("ingest");

  return (
    <div
      className="w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans scroll-smooth relative min-h-screen transition-colors duration-200"
      style={{
        backgroundImage: theme === "dark" ? "radial-gradient(#334155 1px, transparent 1px)" : "radial-gradient(#E2DCD5 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}
    >

      {/* 1. HEADER BRAND BAR */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between max-w-[1300px] w-full mx-auto relative z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleExploreFree}>
          {/* Custom logo mark inspired by Cuvia's clean geometric shape but in bright orange */}
          <div className="w-8 h-8 rounded-xl bg-accent-orange flex items-center justify-center text-white font-bold shadow-md shadow-accent-orange/20">
            N
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            noeta<span className="text-accent-orange">lm</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[0.92rem] font-semibold text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-accent-orange transition-colors duration-150 no-underline">Features</a>
          <a href="#how-it-works" className="hover:text-accent-orange transition-colors duration-150 no-underline">How it works</a>
          <a href="#security" className="hover:text-accent-orange transition-colors duration-150 no-underline">Security & limits</a>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border-none bg-transparent hover:bg-orange-500/5 text-[var(--text-secondary)] hover:text-accent-orange cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={handleOpenAuth}
            className="text-[var(--text-secondary)] hover:text-accent-orange font-semibold cursor-pointer border-none bg-transparent transition-colors"
          >
            Sign in
          </button>

          <button
            onClick={handleExploreFree}
            className="px-5 py-2.5 text-[0.88rem] font-bold bg-accent-orange hover:bg-accent-orange-hover text-white border-none rounded-full shadow-md shadow-accent-orange/10 transition-all duration-150 cursor-pointer"
          >
            Start Free
          </button>
        </nav>
      </header>

      {/* 2. HERO / CANVAS SECTION */}
      <section className="relative w-full max-w-[1300px] mx-auto px-6 pt-12 pb-16 min-h-[700px] flex flex-col justify-between overflow-visible">

        {/* Floating Cards (Absolute layouts surrounding the central mockup) */}
        <div className="hidden lg:block">

          {/* Floating Card: Post-it note */}
          <div className="absolute top-16 left-0 xl:left-4 w-[240px] transform -rotate-[3deg] hover:rotate-0 transition-transform duration-200 z-10">
            <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 shadow-sm border border-red-600" />
            <div className="bg-[#FEF9C3] border border-yellow-200 shadow-lg p-5 rounded-md text-[0.85rem] text-[#713F12] leading-[1.5] font-medium">
              Review core theories in biochemical pathways, summarize matching questions, and sync references.
            </div>
            {/* Floated Checkmark Card */}
            <div className="bg-[var(--bg-card)] border border-[#E2E8F0] rounded-xl p-3 shadow-lg w-14 h-14 flex items-center justify-center -mt-6 ml-6 absolute z-20 hover:scale-105 transition-transform duration-200">
              <div className="w-8 h-8 rounded-lg bg-accent-orange text-white flex items-center justify-center">
                <Check size={18} strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Floating Card: Limits Status */}
          <div className="absolute top-16 right-0 xl:right-4 w-[250px] transform rotate-[3deg] hover:rotate-0 transition-transform duration-200 z-10">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-lg flex gap-3.5 items-center">
              <div className="w-10 h-10 rounded-full bg-[#FFF0ED] dark:bg-accent-orange/15 text-accent-orange flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.78rem] text-[var(--text-muted)] font-bold uppercase tracking-wider block">Limits Status</span>
                <span className="text-[0.9rem] font-extrabold text-[var(--text-primary)] block mt-0.5">Workspace Storage</span>
                {/* Micro progress bar */}
                <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-accent-orange h-full w-[24%]" />
                </div>
                <div className="flex justify-between items-center text-[0.72rem] text-[var(--text-muted)] mt-1">
                  <span>240 MB used</span>
                  <span className="font-bold">1 GB Cap</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card: Ingestions list */}
          <div className="absolute bottom-8 left-0 xl:left-4 w-[250px] transform rotate-[2deg] hover:rotate-0 transition-transform duration-200 z-10">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-lg">
              <span className="text-[0.8rem] font-extrabold text-[var(--text-primary)] mb-3 block uppercase tracking-wider text-accent-orange">Completed Ingestions</span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[0.75rem] mb-1">
                    <span className="font-semibold text-[var(--text-secondary)] truncate">thesis_draft.pdf</span>
                    <span className="text-[#10B981] font-bold">100%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[0.75rem] mb-1">
                    <span className="font-semibold text-[var(--text-secondary)] truncate">diagram_flow.png</span>
                    <span className="text-[#10B981] font-bold">100%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card: LLM routing */}
          <div className="absolute bottom-8 right-0 xl:right-4 w-[250px] transform -rotate-[2deg] hover:rotate-0 transition-transform duration-200 z-10">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-lg">
              <span className="text-[0.8rem] font-bold text-[var(--text-primary)] mb-3 block text-center">Configured LLM Models</span>
              <div className="flex gap-2.5 justify-center py-1">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] border border-accent-orange/20 flex items-center justify-center shadow-sm font-extrabold text-[0.85rem] text-accent-orange">Gem</div>
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[#E2E8F0] flex items-center justify-center shadow-sm font-bold text-[0.85rem] text-[#10B981]">Open</div>
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[#E2E8F0] flex items-center justify-center shadow-sm font-bold text-[0.85rem] text-[#F97316]">Ant</div>
              </div>
              <div className="text-center text-[0.72rem] text-[var(--text-muted)] mt-3 font-medium">
                Personal API Keys Passthrough
              </div>
            </div>
          </div>

        </div>

        {/* Centered Hero Content Block */}
        <div className="text-center relative z-10 max-w-[800px] mx-auto pt-8 md:pt-12 pb-6 px-4 flex-grow flex flex-col justify-center">

          {/* Orange Accent Graphic */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-[var(--bg-card)] p-2 rounded-2xl shadow-lg border border-[var(--border-subtle)] flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-accent-orange text-white flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
          </div>

          <h1 className="text-[2.6rem] md:text-[4rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-[var(--text-primary)] mb-6">
            The <span className="serif-italic text-accent-orange">Easiest</span> Way to <br />
            Organize Your Research
          </h1>

          <p className="text-[1.02rem] md:text-[1.12rem] text-[var(--text-secondary)] leading-relaxed max-w-[600px] mx-auto mb-10 font-medium">
            Bring documents, notes, image diagrams, and web transcripts into secure workspaces. Read, chat, and synthesize insights with instant inline citations.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleExploreFree}
              className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange-hover text-white border-none rounded-full px-8 py-4 text-[0.98rem] font-bold shadow-lg shadow-accent-orange/20 cursor-pointer transition-all duration-150"
            >
              Start Guest Workspace
            </button>
            <button
              onClick={handleOpenAuth}
              className="w-full sm:w-auto bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#0F172A] text-[var(--text-primary)] rounded-full px-8 py-4 text-[0.98rem] font-bold shadow-md cursor-pointer transition-all duration-150"
            >
              Sign In / Register
            </button>
          </div>

        </div>

      </section>

      {/* 3. SHOWCASE MOCKUP WINDOW SECTION */}
      <section className="max-w-[1100px] mx-auto px-6 pb-24 relative z-10">

        {/* Main Mock Browser Workspace */}
        <div className="relative w-full aspect-[16/10] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden group">

          {/* Mock Browser Top bar */}
          <div className="flex justify-between items-center border-b border-[var(--border-subtle)] px-6 py-3.5 bg-[var(--bg-canvas)]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="px-6 py-1 bg-[var(--bg-card)] rounded-full border border-[var(--border-subtle)] text-[0.75rem] text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
              noetalm.app/workspace/biochem_studies
            </div>
            <div className="w-[50px]" />
          </div>

          {/* Mock Web Interface */}
          <div className="absolute inset-x-0 bottom-0 top-[49px] bg-[var(--bg-card)] flex select-none">

            {/* Left sidebar mockup */}
            <div className="w-[220px] hidden md:flex flex-col gap-4 border-r border-[var(--border-subtle)] p-4 bg-[#FCFBF9] dark:bg-[var(--bg-canvas-subtle)]">
              <div className="text-[0.78rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Sources (3)</div>

              <div className="bg-[#FFF0ED] dark:bg-accent-orange/15 border border-accent-orange/20 rounded-xl p-3 flex items-center gap-2.5">
                <FileText size={16} className="text-accent-orange" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-bold text-[var(--text-primary)] truncate">cell_pathway.pdf</div>
                  <div className="text-[0.7rem] text-[var(--text-muted)] font-medium">Pages: 14 • 2.4 MB</div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-2.5 hover:border-accent-orange/30 cursor-pointer">
                <FileText size={16} className="text-[#94A3B8]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-bold text-[var(--text-primary)] truncate">transcripts.srt</div>
                  <div className="text-[0.7rem] text-[var(--text-muted)] font-medium">Timeline: 42m</div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-2.5 hover:border-accent-orange/30 cursor-pointer">
                <FileText size={16} className="text-[#94A3B8]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-bold text-[var(--text-primary)] truncate">diagram.png</div>
                  <div className="text-[0.7rem] text-[var(--text-muted)] font-medium">Image OCR</div>
                </div>
              </div>

              <div className="h-[2px] bg-[#E2DCD5] my-2" />

              <div className="text-[0.78rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Quick Studio</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#FFF0ED] dark:bg-accent-orange/15 hover:bg-[#FFE1DB] dark:hover:bg-accent-orange/25 rounded-lg p-2 text-center text-[0.72rem] font-bold text-accent-orange border border-accent-orange/10 cursor-pointer transition-colors">
                  Quiz
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-2 text-center text-[0.72rem] font-bold text-[var(--text-secondary)] cursor-pointer hover:border-accent-orange/30 transition-colors">
                  Flashcard
                </div>
              </div>
            </div>

            {/* Center Chat feed mockup */}
            <div className="flex-1 flex flex-col justify-between p-6 bg-[var(--bg-card)] border-r border-[var(--border-subtle)]">
              <div className="space-y-4 overflow-y-auto max-h-[80%]">

                {/* User message */}
                <div className="flex items-start justify-end gap-2.5">
                  <div className="bg-[#F1F5F9] dark:bg-[#334155] rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-[0.85rem] text-[var(--text-primary)] font-medium">
                      What are the main stages of Glycolysis and how do they connect to the diagram?
                    </p>
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-orange text-white flex items-center justify-center text-[0.75rem] font-bold shrink-0">
                    AI
                  </div>
                  <div className="bg-[#FFF0ED]/40 border border-accent-orange/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                    <p className="text-[0.85rem] text-[var(--text-primary)] leading-relaxed font-medium">
                      Based on <strong className="text-accent-orange">cell_pathway.pdf [Page 4]</strong>, Glycolysis consists of two main stages: the energy investment phase and the energy payoff phase <span className="bg-accent-orange/10 text-accent-orange px-1 rounded font-extrabold text-[0.72rem] cursor-pointer">[1]</span>.
                    </p>
                    <p className="text-[0.85rem] text-[var(--text-primary)] leading-relaxed font-medium mt-2">
                      The image <strong className="text-accent-orange">diagram.png</strong> maps this visually, showing the conversion of Glucose to Pyruvate <span className="bg-accent-orange/10 text-accent-orange px-1 rounded font-extrabold text-[0.72rem] cursor-pointer">[2]</span>.
                    </p>
                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <div className="h-12 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex items-center px-4 justify-between shadow-sm">
                <span className="text-[0.82rem] text-[#94A3B8] font-medium">Ask questions about cell_pathway.pdf or transcripts.srt...</span>
                <div className="w-8 h-8 rounded-lg bg-accent-orange text-white flex items-center justify-center cursor-pointer shadow-md shadow-accent-orange/10 hover:bg-accent-orange-hover">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Right citation info mockup */}
            <div className="w-[200px] hidden lg:flex flex-col gap-4 p-4 bg-[#FCFBF9] dark:bg-[var(--bg-canvas-subtle)]">
              <div className="text-[0.78rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Citations Used</div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-[0.75rem] font-bold text-[var(--text-primary)]">
                  <span>[1] Pathway Detail</span>
                  <span className="text-accent-orange bg-[#FFF0ED] dark:bg-accent-orange/15 px-1.5 py-0.5 rounded text-[0.68rem]">Page 4</span>
                </div>
                <p className="text-[0.7rem] text-[var(--text-muted)] leading-[1.4] line-clamp-3 font-medium">
                  "...The first phase requires 2 ATP molecules to phosphorylate Glucose..."
                </p>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-[0.75rem] font-bold text-[var(--text-primary)]">
                  <span>[2] Visual OCR</span>
                  <span className="text-accent-orange bg-[#FFF0ED] dark:bg-accent-orange/15 px-1.5 py-0.5 rounded text-[0.68rem]">Diagram</span>
                </div>
                <p className="text-[0.7rem] text-[var(--text-muted)] leading-[1.4] line-clamp-3 font-medium">
                  {"Table elements parsed: Glucose \u2192 G6P \u2192 F6P \u2192 F1,6BP \u2192 Pyruvate."}
                </p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. BRAND TRUST / LOGO STRIP */}
      <section className="py-12 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <p className="text-[0.75rem] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-8">
            Designed for Researchers, Scholars, and Builders Worldwide
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">Google Scholar</span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">arXiv.org</span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">JSTOR</span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">GitHub</span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">Zotero</span>
            <span className="text-[1.1rem] font-extrabold tracking-tight text-[var(--text-secondary)] font-serif italic">Wikipedia</span>
          </div>
        </div>
      </section>

      {/* 5. STEP-BY-STEP WORKFLOW */}
      <section id="how-it-works" className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="max-w-[1100px] mx-auto px-6">

          <div className="text-center mb-16">
            <span className="px-4 py-1.5 rounded-full border border-accent-orange/20 text-[0.8rem] font-bold uppercase tracking-wider mb-4 inline-block bg-[var(--bg-card)] text-accent-orange">
              Walkthrough
            </span>
            <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold tracking-[-0.03em] mt-2 text-[var(--text-primary)]">
              Simple Syntheses Step-by-Step
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <span className="text-5xl font-extrabold text-accent-orange/10 mb-4 block font-serif italic">01</span>
                <h3 className="text-[1.2rem] font-extrabold text-[var(--text-primary)] mb-3">Upload Sources</h3>
                <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                  Drop PDFs, scanned images, transcripts, web links, or typed notes directly. Files are kept private to your session.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="px-2.5 py-1 bg-[#FFF0ED] text-[0.7rem] font-bold text-accent-orange rounded-md">PDF/Word</span>
                <span className="px-2.5 py-1 bg-[#FFF0ED] text-[0.7rem] font-bold text-accent-orange rounded-md">Images</span>
                <span className="px-2.5 py-1 bg-[#FFF0ED] text-[0.7rem] font-bold text-accent-orange rounded-md">Links</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <span className="text-5xl font-extrabold text-accent-orange/10 mb-4 block font-serif italic">02</span>
                <h3 className="text-[1.2rem] font-extrabold text-[var(--text-primary)] mb-3">Deep Analyze</h3>
                <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                  Our system splits files into logical segments, cross-references topics, and rates information based on search relevance.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="px-2.5 py-1 bg-[#FFF0ED] text-[0.7rem] font-bold text-accent-orange rounded-md">Context Analysis</span>
                <span className="px-2.5 py-1 bg-[#FFF0ED] text-[0.7rem] font-bold text-accent-orange rounded-md">Relevance Score</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <span className="text-5xl font-extrabold text-accent-orange/10 mb-4 block font-serif italic">03</span>
                <h3 className="text-[1.2rem] font-extrabold text-[var(--text-primary)] mb-3">Chat & Verify</h3>
                <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                  Ask questions in plain language, receive structured answers, and click on inline citations to view original source passages.
                </p>
              </div>
              <div className="mt-8 flex gap-2">
                <span className="px-2.5 py-1 bg-[#FFF0ED] dark:bg-accent-orange/15 text-[0.7rem] font-bold text-accent-orange rounded-md">Instant Q&A</span>
                <span className="px-2.5 py-1 bg-[#FFF0ED] dark:bg-accent-orange/15 text-[0.7rem] font-bold text-accent-orange rounded-md">Inline Citations</span>
              </div>
            </div>

          </div>

          {/* Selector detail panel matching Cuvia tabs */}
          <div className="mt-16 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[32px] p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">

              <div>
                <span className="text-accent-orange font-bold text-[0.85rem] uppercase tracking-wider block mb-2">Workspace Technology</span>
                <h3 className="text-[1.8rem] font-extrabold text-[var(--text-primary)] mb-4">
                  Fully Integrated Source Retrieval
                </h3>
                <p className="text-[0.95rem] text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                  When you submit prompts, our synthesis engine compiles target background documents in real-time. It maps overlapping contexts and ranks details before drafting responses, guaranteeing accuracy.
                </p>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FFF0ED] dark:bg-accent-orange/15 text-accent-orange flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                    <span className="text-[0.88rem] font-semibold text-[var(--text-primary)]">Grounded in your actual uploaded files</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FFF0ED] dark:bg-accent-orange/15 text-accent-orange flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                    <span className="text-[0.88rem] font-semibold text-[var(--text-primary)]">Strict citations linked to exact pages</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FFF0ED] dark:bg-accent-orange/15 text-accent-orange flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                    <span className="text-[0.88rem] font-semibold text-[var(--text-primary)]">Personal key passthrough for custom model routes</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div
                  onClick={() => setActiveStep("ingest")}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-150 border ${activeStep === "ingest" ? "bg-[#FFF0ED] dark:bg-accent-orange/15 border-accent-orange" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-accent-orange/30"}`}
                >
                  <h4 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] mb-1">Step 1: Upload Documents</h4>
                  <p className="text-[0.82rem] text-[var(--text-secondary)] font-medium">Parse and segment text across multiple formats asynchronously.</p>
                </div>

                <div
                  onClick={() => setActiveStep("search")}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-150 border ${activeStep === "search" ? "bg-[#FFF0ED] dark:bg-accent-orange/15 border-accent-orange" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-accent-orange/30"}`}
                >
                  <h4 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] mb-1">Step 2: Semantic Relevance Sort</h4>
                  <p className="text-[0.82rem] text-[var(--text-secondary)] font-medium">Formulate clean target queries and extract matching context segments.</p>
                </div>

                <div
                  onClick={() => setActiveStep("chat")}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-150 border ${activeStep === "chat" ? "bg-[#FFF0ED] dark:bg-accent-orange/15 border-accent-orange" : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-accent-orange/30"}`}
                >
                  <h4 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] mb-1">Step 3: Citations & Answer Synthesis</h4>
                  <p className="text-[0.82rem] text-[var(--text-secondary)] font-medium">Stream final replies with direct references linked back to source files.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. PLATFORM FEATURES (Grid Layout exactly matching Cuvia) */}
      <section id="features" className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="max-w-[1100px] mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-[2.2rem] md:text-[3rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)]">
              Everything You Need — And More
            </h2>
            <p className="text-[1.02rem] text-[var(--text-secondary)] mt-3 max-w-[620px] mx-auto font-medium">
              We compile your information assets and give you immediate study, analysis, and extraction tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <Bot size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Smart Source Chat</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Interact with your workspace through a responsive assistant that streams answers grounded in your specific documents.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <FileText size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Automatic Briefs & Summaries</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Instantly generate structural outlines, study briefs, and summaries from multi-page PDFs or complex articles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <Layers size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Interactive Practice Quizzes</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Create custom quizzes with multiple-choice questions to review concepts and test knowledge of your uploaded sources.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <Sparkles size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Quick-Study Flashcards</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Extract key terms, vocabulary words, or conceptual formulas into custom cards to speed up learning.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <Database size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Visual Image-to-Table Converter</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Convert image screenshots, data charts, and handwritten layouts directly into structured, editable tables and text.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col hover:border-accent-orange/40 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6">
                <Network size={22} />
              </div>
              <h3 className="text-[1.15rem] font-extrabold mb-3 text-[var(--text-primary)]">Interactive Visual Mind Maps</h3>
              <p className="text-[0.88rem] text-[var(--text-secondary)] leading-relaxed font-medium">
                Build concept charts and mapped notes to visualize connection strings and relational pathways among documents.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. TESTIMONIAL SECTION */}
      <section className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="max-w-[850px] mx-auto px-6 text-center">
          <span className="text-accent-orange font-bold text-[0.85rem] uppercase tracking-wider block mb-4">Reviews</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-12 tracking-tight">
            Trusted by Researchers & Builders
          </h2>

          {/* Testimonial card */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 md:p-12 shadow-lg relative">
            <span className="text-7xl font-serif text-accent-orange/15 absolute top-4 left-6 select-none">“</span>

            <p className="text-[1.1rem] md:text-[1.28rem] text-[var(--text-primary)] leading-relaxed font-medium relative z-10 font-serif italic">
              noetalm has completely changed how I read academic papers. Instead of wasting time searching through thousands of pages of text or scanning footnotes, I get immediate summaries and exact links to original pages.
            </p>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-accent-orange text-white flex items-center justify-center font-extrabold shadow-md mb-3">
                ER
              </div>
              <div className="text-[0.92rem] font-bold text-[var(--text-primary)]">Dr. Elena Rostova</div>
              <div className="text-[0.78rem] text-[var(--text-muted)] font-semibold mt-0.5">Postdoctoral Fellow in Molecular Biology</div>
            </div>

            {/* Small decorative orange bubble */}
            <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-accent-orange shadow-lg shadow-accent-orange/30" />
          </div>

        </div>
      </section>

      {/* 8. SECURITY & GUARDRAILS */}
      <section id="security" className="py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="text-accent-orange font-bold text-[0.85rem] uppercase tracking-wider block mb-2">Safety first</span>
              <h2 className="text-[2.2rem] md:text-[2.8rem] font-extrabold text-[var(--text-primary)] tracking-[-0.03em] mb-6">
                Data Privacy & Secure Guardrails
              </h2>
              <p className="text-[0.98rem] text-[var(--text-secondary)] leading-relaxed mb-8 font-medium">
                Your uploaded research materials are kept completely isolated. Sessions are secure, and workspaces respect size limits to ensure performance is always optimal.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <Database size={20} className="text-accent-orange mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-[0.95rem] text-[var(--text-primary)]">Strict 1GB Storage Limit</h4>
                    <p className="text-[0.85rem] text-[var(--text-secondary)] mt-0.5 font-medium">Enforced storage caps keep document ingestion balanced and avoid upload abuse.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <Lock size={20} className="text-accent-orange mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-[0.95rem] text-[var(--text-primary)]">Private Document Storage</h4>
                    <p className="text-[0.85rem] text-[var(--text-secondary)] mt-0.5 font-medium">All documents map privately using secure session validation to keep assets safe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck size={20} className="text-accent-orange mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-[0.95rem] text-[var(--text-primary)]">Automatic Rate Limits</h4>
                    <p className="text-[0.85rem] text-[var(--text-secondary)] mt-0.5 font-medium">Token-Bucket filters prevent request spikes and guarantee constant app availability.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-canvas)] rounded-[32px] p-8 md:p-10 border border-[var(--border-subtle)] flex flex-col items-start shadow-md relative overflow-hidden">
              <span className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-6 relative z-10">
                <Shield size={24} />
              </span>
              <h3 className="text-[1.38rem] font-extrabold mb-4 text-[var(--text-primary)] relative z-10">
                Test Out the System for Free
              </h3>
              <p className="text-[0.92rem] text-[var(--text-secondary)] leading-relaxed mb-8 font-medium relative z-10">
                Start research workspaces instantly without creating an account. Upload reference sheets, diagrams, or links. Upgrade to a permanent account at any time to sync workspace folders across all your devices.
              </p>
              <button
                onClick={handleExploreFree}
                className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white border-none rounded-full py-4 text-[0.98rem] font-bold cursor-pointer transition-colors duration-150 relative z-10"
              >
                Start Guest Workspace (10 prompts/notebook)
              </button>

              {/* Decorative background shape */}
              <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-accent-orange/5" />
            </div>

          </div>
        </div>
      </section>

      {/* 9. FOOTER BRAND BAR */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border-subtle)] px-6 md:px-12 py-16 relative z-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.5fr] gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-orange flex items-center justify-center text-white font-bold text-[0.9rem]">
                N
              </div>
              <span className="text-lg font-extrabold text-[var(--text-primary)]">noetalm</span>
            </div>
            <p className="text-[0.85rem] text-[var(--text-secondary)] leading-relaxed max-w-[300px] font-medium">
              Source-grounded research workspaces. Connect files, extract images, and chat with precise inline references.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5 text-[0.88rem] font-medium">
            <span className="font-extrabold text-[var(--text-primary)] mb-1.5 uppercase tracking-wider text-[0.78rem] text-accent-orange">Navigation</span>
            <a href="#features" className="text-[var(--text-secondary)] hover:text-accent-orange no-underline transition-colors">Platform Features</a>
            <a href="#how-it-works" className="text-[var(--text-secondary)] hover:text-accent-orange no-underline transition-colors">How it works</a>
            <a href="#security" className="text-[var(--text-secondary)] hover:text-accent-orange no-underline transition-colors">Security & Limits</a>
          </div>

          {/* Stay up to date form */}
          <div className="space-y-4">
            <span className="font-extrabold text-[var(--text-primary)] block uppercase tracking-wider text-[0.78rem] text-accent-orange">Stay Updated</span>
            <div className="flex items-center bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-full p-1.5 pl-5 justify-between max-w-[360px]">
              <input
                type="email"
                placeholder="Enter your email"
                className="border-none bg-transparent outline-none text-[0.85rem] flex-grow text-[var(--text-primary)] pr-3 font-semibold placeholder-[#94A3B8]"
              />
              <button
                onClick={handleExploreFree}
                className="w-9 h-9 rounded-full bg-accent-orange text-white border-none flex items-center justify-center cursor-pointer hover:bg-accent-orange-hover transition-colors shrink-0 shadow-md shadow-accent-orange/10"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1100px] mx-auto pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.82rem] text-[var(--text-muted)] font-medium">
            © {new Date().getFullYear()} Sundaram Singh. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            <a href="https://github.com/Sundaram26/" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-accent-orange transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
            </a>
            <a href="https://x.com/sundaram_04" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-accent-orange transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://www.linkedin.com/in/sundaram-singh-b5aa4823b/" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-accent-orange transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
