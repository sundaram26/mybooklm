"use client";

import React from "react";
import { Search, Key, Sun, Moon, Monitor, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme-provider";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSession, signOut } from "../../lib/auth-client";

interface AppTopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function AppTopBar({ searchQuery, onSearchChange }: AppTopBarProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;
  const { setAuthModalOpen } = useWorkspaceStore();
  const router = useRouter();

  const THEMES = [
    { v: "light",  Icon: Sun     },
    { v: "dark",   Icon: Moon    },
    { v: "system", Icon: Monitor },
  ] as const;

  return (
    <header className="flex items-center justify-between h-[52px] px-6 shrink-0 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
      {/* Left: Logo */}
      <button
        onClick={() => { router.push("/"); }}
        className="flex items-center gap-[7px] bg-transparent border-none cursor-pointer p-0"
      >
        <div className="flex items-center justify-center shrink-0 w-5 h-5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <span className="text-[10px] font-extrabold text-[var(--accent-orange)]">N</span>
        </div>
        <span className="text-sm font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[family-name:var(--font-heading)]">
          noetalm
        </span>
      </button>

      {/* Center: Search */}
      <div className="relative flex items-center">
        <Search size={12} className="absolute left-[9px] text-[var(--text-subtle)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search notebooks..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-[220px] focus:w-[260px] py-[5px] pr-[12px] pl-[27px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] focus:border-[var(--accent-orange)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-[0.78rem] outline-none transition-all"
        />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">

        {/* Theme switcher */}
        <div className="flex gap-[1px] p-[2px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {THEMES.map(({ v, Icon }) => (
            <button
              key={v}
              title={v}
              onClick={() => setTheme(v)}
              className={`flex items-center justify-center py-1 px-[7px] rounded-[calc(var(--radius-md)-2px)] border-none cursor-pointer transition-all ${theme === v ? 'bg-[var(--bg-canvas)] text-[var(--text-primary)]' : 'bg-transparent text-[var(--text-subtle)]'}`}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-[var(--border-subtle)]" />

        {/* User */}
        <div className="flex items-center gap-[6px]">
          <div className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-[0.65rem] font-bold">
            {user?.name?.[0]?.toUpperCase() || "G"}
          </div>
          <div className="flex flex-col">
            <span className="text-[0.75rem] font-medium text-[var(--text-primary)] leading-[1.2]">
              {user?.name || "Guest"}
            </span>
            <span className="text-[0.65rem] text-[var(--text-subtle)] leading-[1.2]">
              {user?.email || "guest mode"}
            </span>
          </div>
          {user && !(user as any).isAnonymous ? (
            <button onClick={() => signOut()} className="flex p-[2px] bg-transparent border-none cursor-pointer text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors">
              <LogOut size={13} />
            </button>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="flex p-[2px] bg-transparent border-none cursor-pointer text-[var(--accent-orange)] hover:opacity-80 transition-opacity">
              <LogIn size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
