"use client";

import React from "react";
import { Search, Filter, Plus, ChevronRight, Key, Sparkles } from "lucide-react";

interface HeaderProps {
  activeNotebookTitle?: string;
  onNavigateHome: () => void;
  onOpenCreateNotebook: () => void;
  onOpenAddSource?: () => void;
  onOpenKeySettings: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Header({
  activeNotebookTitle,
  onNavigateHome,
  onOpenCreateNotebook,
  onOpenAddSource,
  onOpenKeySettings,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  return (
    <header style={{
      height: "64px",
      borderBottom: "1px solid var(--border-subtle)",
      backgroundColor: "var(--bg-canvas)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0
    }}>
      {/* Breadcrumb & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button 
          onClick={onNavigateHome}
          className="btn btn-ghost" 
          style={{ padding: "4px 8px", fontSize: "0.88rem", color: "var(--text-muted)" }}
        >
          Projects
        </button>
        {activeNotebookTitle && (
          <>
            <ChevronRight size={14} style={{ color: "var(--text-subtle)" }} />
            <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)" }}>
              {activeNotebookTitle}
            </span>
          </>
        )}
      </div>

      {/* Right Controls: Search + Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search Bar */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center"
        }}>
          <Search size={16} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search notes, documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              padding: "8px 12px 8px 36px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              width: "220px",
              transition: "all var(--transition-fast)"
            }}
          />
        </div>

        {/* API Keys Modal Button */}
        <button 
          onClick={onOpenKeySettings}
          className="btn btn-secondary"
          title="Configure Custom LLM API Keys"
        >
          <Key size={15} />
          <span>LLM Keys</span>
        </button>

        {/* Action Buttons */}
        {activeNotebookTitle && onOpenAddSource ? (
          <button onClick={onOpenAddSource} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Source</span>
          </button>
        ) : (
          <button onClick={onOpenCreateNotebook} className="btn btn-primary">
            <Plus size={16} />
            <span>New Notebook</span>
          </button>
        )}
      </div>
    </header>
  );
}
