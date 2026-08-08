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
    <footer style={{
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--bg-canvas)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: "44px",
      flexShrink: 0,
    }}>
      {/* Left: App identity */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <BookOpen size={13} style={{ color: "var(--text-subtle)" }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: "500" }}>
            noetalm
          </span>
          <span style={{
            fontSize: "0.62rem", padding: "1px 5px",
            borderRadius: "3px",
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
            color: "var(--text-subtle)", fontWeight: "500",
          }}>
            v1.6.25
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isGuest && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <ShieldAlert size={11} style={{ color: "var(--accent-orange)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {guestTurnCount}/20 turns
            </span>
          </div>
        )}
      </div>

      {/* Center: Tab navigation */}
      <div />

      {/* Right: Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Online</span>
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
          {user?.name || "Guest"} ↑
        </span>
      </div>
    </footer>
  );
}
