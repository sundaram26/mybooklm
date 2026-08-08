"use client";

import React from "react";
import { Home, FileText, Settings, BookOpen, ShieldAlert } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSession } from "../../lib/auth-client";
import { useProjects } from "../../lib/hooks";

const TABS = [
  { key: "dashboard", icon: Home,     label: "Overview"    },
  { key: "sources",   icon: FileText,  label: "Sources"     },
] as const;

export function AppBottomBar() {
  const { guestTurnCount } = useWorkspaceStore();
  const { data: session } = useSession();
  const { data: projects = [] } = useProjects();
  const user = session?.user;
  const isGuest = !user || (user as any).isAnonymous;

  return (
    <footer className="flex items-center justify-between px-6 h-[44px] shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      {/* Left: App identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-[6px]">
          <BookOpen size={13} className="text-[var(--text-subtle)]" />
          <span className="text-[0.72rem] text-[var(--text-subtle)] font-medium">
            noetalm
          </span>
          <span className="text-[0.62rem] py-[1px] px-[5px] rounded-[3px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-subtle)] font-medium">
            v1.6.25
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-[5px] h-[5px] rounded-full bg-[#34D399]" />
          <span className="text-[0.72rem] text-[var(--text-subtle)]">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isGuest && (
          <div className="flex items-center gap-[5px]">
            <ShieldAlert size={11} className="text-[var(--text-muted)]" />
            <span className="text-[0.75rem] text-[var(--text-muted)]">
              <span className="text-[var(--text-primary)] font-semibold">{guestTurnCount}</span>/20 turns
            </span>
          </div>
        )}
      </div>

      {/* Center: Tab navigation */}
      <div />

      {/* Right: Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[6px]">
          <div className="w-[6px] h-[6px] rounded-full bg-[var(--status-success-text)] shadow-[0_0_8px_var(--status-success-bg)]" />
          <span className="text-[0.75rem] font-medium text-[var(--text-secondary)]">Online</span>
        </div>
        <span className="text-[0.75rem] text-[var(--text-subtle)]">
          {user?.name || "Guest"} ↑
        </span>
      </div>
    </footer>
  );
}
