"use client";

import React from "react";
import {
  BookOpen, Home, FileText, Settings,
  LogIn, LogOut, ShieldAlert, Plus, Loader2,
  Image as ImageIcon, Link as LinkIcon, FileCode,
  ArrowLeft, Sun, Moon, Monitor,
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useSession, signOut } from "../../lib/auth-client";
import { useDocuments } from "../../lib/hooks";

const YoutubeIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);

const NAV_ITEMS = [
  { key: "dashboard", icon: Home,     label: "Overview"    },
  { key: "sources",   icon: FileText,  label: "All Sources" },
  { key: "settings",  icon: Settings,  label: "Settings"    },
] as const;

const THEME_OPTIONS = [
  { value: "light",  Icon: Sun     },
  { value: "dark",   Icon: Moon    },
  { value: "system", Icon: Monitor },
] as const;

function navBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: "8px",
    width: "100%", padding: "6px 8px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: active ? "var(--bg-surface)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    fontSize: "0.8125rem", fontWeight: active ? 500 : 400,
    cursor: "pointer", textAlign: "left",
    transition: "all var(--transition-fast)",
  };
}

function docBtnStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: "8px",
    width: "100%", padding: "5px 8px",
    borderRadius: "var(--radius-md)",
    border: "none",
    background: active ? "var(--bg-surface)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-muted)",
    fontSize: "0.75rem", cursor: "pointer", textAlign: "left",
    transition: "all var(--transition-fast)",
  };
}

function themeBtnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "4px", borderRadius: "calc(var(--radius-md) - 2px)",
    border: "none", cursor: "pointer",
    background: active ? "var(--bg-canvas)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-subtle)",
    transition: "all var(--transition-fast)",
  };
}

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;

  const {
    currentView, setCurrentView,
    selectedNotebook, setSelectedNotebook,
    setViewMode, setAuthModalOpen, setCreateModalOpen,
    guestTurnCount,
    selectedDocumentId, setSelectedDocumentId,
    centerPanelMode, setCenterPanelMode,
  } = useWorkspaceStore();

  const { data: documents = [], isLoading: isLoadingDocs } =
    useDocuments(selectedNotebook?.id || undefined);

  const getDocIcon = (doc: any) => {
    const t = doc.title?.toLowerCase() || "";
    if (doc.type === "IMAGE") return <ImageIcon size={13} />;
    if (doc.type === "URL") {
      if (t.includes("youtube") || t.includes("youtu.be")) return <YoutubeIcon size={13} />;
      return <LinkIcon size={13} />;
    }
    if (t.endsWith(".vtt") || t.endsWith(".srt")) return <FileCode size={13} />;
    return <FileText size={13} />;
  };

  const isInNotebook = !!(selectedNotebook && currentView === "notebook");

  return (
    <aside style={{
      width: "var(--sidebar-width)", height: "100%",
      background: "var(--bg-canvas)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          onClick={() => setViewMode("landing")}
        >
          <div style={{
            width: "22px", height: "22px", borderRadius: "5px",
            background: "var(--accent-orange)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <BookOpen size={12} color="#fff" />
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            noetalm
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "8px 8px 0", overflowY: "auto", minHeight: 0 }}>
        {isInNotebook ? (
          <>
            {/* Back */}
            <button
              style={navBtnStyle(false)}
              onClick={() => { setCurrentView("dashboard"); setSelectedNotebook(null); }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <ArrowLeft size={13} />
              <span>All Notebooks</span>
            </button>

            <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 0" }} />

            <p style={{
              fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--text-subtle)", padding: "8px 8px 4px",
            }}>
              Sources
            </p>

            {/* Add source */}
            <button
              style={{
                ...navBtnStyle(centerPanelMode === "add-source"),
                color: centerPanelMode === "add-source" ? "var(--accent-orange)" : "var(--text-muted)",
              }}
              onClick={() => { setCenterPanelMode("add-source"); setSelectedDocumentId(null); }}
            >
              <Plus size={13} />
              <span>Add Source</span>
            </button>

            {/* Document list */}
            <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "1px" }}>
              {isLoadingDocs ? (
                <div style={{ padding: "12px 8px" }}>
                  <Loader2 size={14} style={{ color: "var(--text-subtle)", animation: "spin 1s linear infinite" }} />
                </div>
              ) : documents.length === 0 ? (
                <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", padding: "8px" }}>
                  No sources yet.
                </p>
              ) : (
                documents.map((doc: any) => {
                  const active = selectedDocumentId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      style={docBtnStyle(active)}
                      onClick={() => {
                        if (active) setSelectedDocumentId(null);
                        else { setSelectedDocumentId(doc.id); setCenterPanelMode("chat"); }
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }
                      }}
                    >
                      <span style={{ flexShrink: 0, color: "var(--text-subtle)" }}>{getDocIcon(doc)}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {doc.title}
                      </span>
                      <span style={{
                        width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                        background: doc.status === "PENDING" || doc.status === "PROCESSING"
                          ? "#FBBF24" : doc.status === "FAILED" ? "#F87171" : "#34D399",
                      }} />
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            {/* Dashboard nav */}
            <p style={{
              fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--text-subtle)", padding: "8px 8px 4px",
            }}>
              Workspace
            </p>

            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
              const active = currentView === key;
              return (
                <button
                  key={key}
                  style={navBtnStyle(active)}
                  onClick={() => { setCurrentView(key); if (key === "dashboard") setSelectedNotebook(null); }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              );
            })}

            <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 0" }} />

            <button
              style={navBtnStyle(false)}
              onClick={() => setCreateModalOpen(true)}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <Plus size={14} />
              <span>New Notebook</span>
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "10px 12px 12px",
        display: "flex", flexDirection: "column", gap: "8px",
      }}>
        {/* Guest warning */}
        {(!user || (user as any).isAnonymous) && (
          <div style={{
            padding: "8px 10px", borderRadius: "var(--radius-md)",
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
              <ShieldAlert size={11} style={{ color: "var(--accent-orange)" }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)" }}>Guest mode</span>
            </div>
            <div style={{ width: "100%", height: "2px", background: "var(--border-subtle)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "var(--accent-orange)", width: `${Math.min(100, (guestTurnCount / 20) * 100)}%` }} />
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-subtle)", marginTop: "3px", display: "block" }}>
              {guestTurnCount}/20 turns used
            </span>
          </div>
        )}

        {/* Theme switcher */}
        <div style={{
          display: "flex", gap: "2px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)", padding: "2px",
        }}>
          {THEME_OPTIONS.map(({ value, Icon }) => (
            <button
              key={value}
              title={value}
              style={themeBtnStyle(theme === value)}
              onClick={() => setTheme(value)}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        {/* User row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "var(--accent-orange)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "G"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Guest User"}
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email || "Temporary session"}
            </div>
          </div>
          {user && !(user as any).isAnonymous ? (
            <button
              onClick={() => signOut()}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "2px", display: "flex" }}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-orange)", padding: "2px", display: "flex" }}
              title="Sign in"
            >
              <LogIn size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
