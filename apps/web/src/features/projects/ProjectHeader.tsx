"use client";

import React from "react";
import { BookOpen, Copy, Settings, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { useDocuments } from "../../lib/hooks";
import { Project } from "@repo/shared";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { data: documents = [] } = useDocuments(project?.id);

  return (
    <header className="flex items-center justify-between px-4 h-[52px] bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] shrink-0">
      {/* Left: back + title */}
      <div className="flex items-center gap-[10px] overflow-hidden">
        <button
          onClick={() => { router.push("/"); }}
          className="flex items-center gap-[5px] bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[0.78rem] py-1 px-[6px] rounded-[var(--radius-md)] transition-colors shrink-0"
        >
          <ChevronLeft size={14} />
          <span>Projects</span>
        </button>

        <div className="w-[1px] h-4 bg-[var(--border-subtle)] shrink-0" />

        <div className="flex items-center gap-[7px] overflow-hidden">
          <div className="flex items-center justify-center shrink-0 w-[18px] h-[18px] rounded-[4px] bg-[var(--accent-orange)]">
            <BookOpen size={10} color="#fff" />
          </div>
          <span className="text-[0.84rem] font-semibold text-[var(--text-primary)] truncate">
            {project.title}
          </span>
        </div>

        <span className="text-[0.68rem] text-[var(--text-subtle)] shrink-0 py-[2px] px-[6px] rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          {documents.length} source{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-[6px]">
        <button
          className="flex items-center gap-[5px] bg-transparent border border-[var(--border-subtle)] text-[var(--text-muted)] text-[0.75rem] py-1 px-[10px] rounded-[var(--radius-md)] cursor-pointer transition-all hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
        >
          <Copy size={12} /> Copy
        </button>
        <button
          className="flex items-center gap-[5px] bg-transparent border border-[var(--border-subtle)] text-[var(--text-muted)] text-[0.75rem] py-1 px-[10px] rounded-[var(--radius-md)] cursor-pointer transition-all hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
        >
          <Settings size={12} /> Settings
        </button>

        <div className="w-[1px] h-4 bg-[var(--border-subtle)]" />

        {/* Avatar */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[0.65rem] font-bold">
          {user?.name?.[0]?.toUpperCase() || "G"}
        </div>
      </div>
    </header>
  );
}
