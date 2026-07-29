"use client";

import React from "react";
import { Home, FileText, Settings, BookOpen, ShieldAlert } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSession } from "../../lib/auth-client";
import { useNotebooks } from "../../lib/hooks";

const TABS = [
  { key: "dashboard", icon: Home,     label: "Overview"    },
  { key: "sources",   icon: FileText,  label: "Sources"     },
] as const;

export function AppBottomBar() {
  const { currentView, setCurrentView, setSelectedNotebook, guestTurnCount } = useWorkspaceStore();
  const { data: session } = useSession();
  const { data: notebooks = [] } = useNotebooks();
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
            {notebooks.length} notebook{notebooks.length !== 1 ? "s" : ""}
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
      <nav style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {TABS.map(({ key, icon: Icon, label }, i) => {
          const active = currentView === key;
          return (
            <button
              key={key}
              onClick={() => { setCurrentView(key); if (key === "dashboard") setSelectedNotebook(null); }}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 12px", borderRadius: "var(--radius-md)",
                border: "none", background: "transparent", cursor: "pointer",
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "0.78rem", fontWeight: active ? "600" : "400",
                transition: "all var(--transition-fast)",
                position: "relative",
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}}
            >
              <span style={{
                display: "inline-flex",
                position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                width: active ? "20px" : "0", height: "2px",
                background: "var(--accent-orange)", borderRadius: "999px",
                transition: "width var(--transition-fast)",
              }} />
              <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: "500" }}>
                0{i + 1}
              </span>
              <Icon size={13} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

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
