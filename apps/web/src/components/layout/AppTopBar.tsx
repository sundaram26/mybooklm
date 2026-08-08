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
    <header style={{
      height: "52px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-canvas)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px", flexShrink: 0,
    }}>
      {/* Left: Logo */}
      <button
        onClick={() => { router.push("/"); }}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "none", border: "none", cursor: "pointer", padding: "0",
        }}
      >
        <div style={{
          width: "20px", height: "20px", borderRadius: "4px",
          background: "var(--accent-orange)", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ color: "#fff", fontSize: "10px", fontWeight: "800" }}>N</span>
        </div>
        <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          noetalm
        </span>
      </button>

      {/* Center: Search */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <Search size={12} style={{
          position: "absolute", left: "9px",
          color: "var(--text-subtle)", pointerEvents: "none",
        }} />
        <input
          type="text"
          placeholder="Search notebooks..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{
            padding: "5px 12px 5px 27px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: "0.78rem", outline: "none",
            width: "220px", transition: "all var(--transition-fast)",
          }}
          onFocus={e => {
            (e.target as HTMLInputElement).style.borderColor = "var(--accent-orange)";
            (e.target as HTMLInputElement).style.width = "260px";
          }}
          onBlur={e => {
            (e.target as HTMLInputElement).style.borderColor = "var(--border-subtle)";
            (e.target as HTMLInputElement).style.width = "220px";
          }}
        />
      </div>

      {/* Right: Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

        {/* Theme switcher */}
        <div style={{
          display: "flex", gap: "1px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: "2px",
        }}>
          {THEMES.map(({ v, Icon }) => (
            <button
              key={v}
              title={v}
              onClick={() => setTheme(v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "4px 7px", borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none", cursor: "pointer",
                background: theme === v ? "var(--bg-canvas)" : "transparent",
                color: theme === v ? "var(--text-primary)" : "var(--text-subtle)",
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>



        {/* Divider */}
        <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)" }} />

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "var(--accent-orange)",
            color: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.65rem", fontWeight: "700", flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "G"}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "500", color: "var(--text-primary)", lineHeight: 1.2 }}>
              {user?.name || "Guest"}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-subtle)", lineHeight: 1.2 }}>
              {user?.email || "guest mode"}
            </span>
          </div>
          {user && !(user as any).isAnonymous ? (
            <button onClick={() => signOut()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", display: "flex", padding: "2px" }}>
              <LogOut size={13} />
            </button>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-orange)", display: "flex", padding: "2px" }}>
              <LogIn size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
