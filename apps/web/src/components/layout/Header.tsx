"use client";

import React from "react";
import { Search, Plus, Key, ChevronRight } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const {
    selectedNotebook, setSelectedNotebook, setCurrentView,
    setCreateModalOpen, setCenterPanelMode, setSelectedDocumentId,
  } = useWorkspaceStore();

  return (
    <header style={{
      height: "48px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-canvas)",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px", flexShrink: 0, gap: "12px",
    }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
        <button
          onClick={() => { setSelectedNotebook(null); setCurrentView("dashboard"); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.8rem", color: "var(--text-muted)",
            padding: "2px 4px", borderRadius: "var(--radius-sm)",
            transition: "color var(--transition-fast)",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
        >
          Notebooks
        </button>
        {selectedNotebook && (
          <>
            <ChevronRight size={12} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
            <span style={{
              fontSize: "0.8rem", fontWeight: "500", color: "var(--text-primary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {selectedNotebook.title}
            </span>
          </>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={12} style={{
            position: "absolute", left: "9px",
            color: "var(--text-subtle)", pointerEvents: "none",
          }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              padding: "5px 10px 5px 26px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "0.78rem", outline: "none",
              width: "180px", transition: "all var(--transition-fast)",
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--accent-orange)"; (e.target as HTMLInputElement).style.width = "220px"; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--border-subtle)"; (e.target as HTMLInputElement).style.width = "180px"; }}
          />
        </div>


        {/* Primary action */}
        {selectedNotebook ? (
          <button
            onClick={() => { setCenterPanelMode("add-source"); setSelectedDocumentId(null); }}
            className="btn btn-primary"
            style={{ padding: "5px 12px", fontSize: "0.76rem" }}
          >
            <Plus size={13} />
            <span>Add Source</span>
          </button>
        ) : (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: "5px 12px", fontSize: "0.76rem" }}
          >
            <Plus size={13} />
            <span>New Notebook</span>
          </button>
        )}
      </div>
    </header>
  );
}
