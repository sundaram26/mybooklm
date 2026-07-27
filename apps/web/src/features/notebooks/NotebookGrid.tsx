"use client";

import React from "react";
import { Plus, BookOpen, Trash2, FileText, Clock, ArrowUpRight } from "lucide-react";
import { Notebook } from "../../lib/api";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useNotebooks, useDeleteNotebook } from "../../lib/hooks";

interface NotebookGridProps {
  searchQuery: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function NotebookGrid({ searchQuery }: NotebookGridProps) {
  const { setSelectedNotebook, setCurrentView, setActiveTab, setCreateModalOpen } = useWorkspaceStore();
  const { data: notebooks = [], isLoading } = useNotebooks();
  const deleteMutation = useDeleteNotebook();

  const open = (nb: Notebook) => { setSelectedNotebook(nb); setCurrentView("notebook"); setActiveTab("chat"); };

  const del = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Delete "${title}"?`)) await deleteMutation.mutateAsync(id);
  };

  const filtered = notebooks.filter(nb =>
    nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nb.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // ─── styles ──────────────────────────────────────────────────────────────

  const wrap: React.CSSProperties = {
    flex: 1, overflowY: "auto",
    background: "var(--bg-canvas)",
  };

  const inner: React.CSSProperties = {
    maxWidth: "960px", margin: "0 auto",
    padding: "28px 32px",
  };

  const pageTitle: React.CSSProperties = {
    fontSize: "0.8125rem", fontWeight: "500",
    color: "var(--text-secondary)", marginBottom: "20px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
  };

  const table: React.CSSProperties = {
    width: "100%",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  };

  const thead: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 100px 90px 80px 36px",
    padding: "0 16px",
    borderBottom: "1px solid var(--border-subtle)",
    background: "var(--bg-surface)",
  };

  const th: React.CSSProperties = {
    padding: "8px 0",
    fontSize: "0.68rem", fontWeight: "600",
    letterSpacing: "0.06em", textTransform: "uppercase",
    color: "var(--text-subtle)",
  };

  return (
    <div style={wrap}>
      <div style={inner}>

        {/* Page header */}
        <div style={pageTitle}>
          <div>
            <h1 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>
              Notebooks
            </h1>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {notebooks.length} notebook{notebooks.length !== 1 ? "s" : ""} · grounded AI research workspace
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={13} />
            New Notebook
          </button>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div style={table}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: "48px", borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none",
                background: "var(--bg-surface)", animation: "pulse 1.5s ease-in-out infinite",
                opacity: 1 - i * 0.15,
              }} />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && filtered.length > 0 && (
          <div style={table}>
            {/* Header row */}
            <div style={thead}>
              <span style={th}>Name</span>
              <span style={{ ...th, textAlign: "right" }}>Sources</span>
              <span style={{ ...th, textAlign: "right" }}>Updated</span>
              <span style={{ ...th, textAlign: "right" }}>Size</span>
              <span style={th} />
            </div>

            {/* Data rows */}
            {filtered.map((nb, idx) => {
              const docCount = nb._count?.documents ?? nb.documents?.length ?? 0;
              const sizeMB   = ((nb.documents || []).reduce((a, d) => a + (d.fileSize || 0), 0) / 1048576).toFixed(1);
              const isLast   = idx === filtered.length - 1;

              return (
                <div
                  key={nb.id}
                  onClick={() => open(nb)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 90px 80px 36px",
                    padding: "0 16px",
                    borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                    background: "var(--bg-surface)",
                    cursor: "pointer",
                    transition: "background var(--transition-fast)",
                    alignItems: "center",
                    minHeight: "48px",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"}
                >
                  {/* Name + description */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", paddingRight: "12px" }}>
                    <BookOpen size={14} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nb.title}
                      </div>
                      {nb.description && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {nb.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sources */}
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                    <FileText size={11} style={{ color: "var(--text-subtle)" }} />
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{docCount}</span>
                  </div>

                  {/* Updated */}
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                    <Clock size={11} style={{ color: "var(--text-subtle)" }} />
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{timeAgo(nb.updatedAt)}</span>
                  </div>

                  {/* Size */}
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>{sizeMB} MB</span>
                  </div>

                  {/* Delete */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={e => del(e, nb.id, nb.title)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-subtle)", padding: "4px", borderRadius: "var(--radius-sm)",
                        display: "flex", alignItems: "center", transition: "color var(--transition-fast)",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--status-error-text)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-subtle)"}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state — compact */}
        {!isLoading && filtered.length === 0 && (
          <div style={{
            border: "1px dashed var(--border-medium)",
            borderRadius: "var(--radius-lg)",
            padding: "40px 24px",
            textAlign: "center",
            background: "var(--bg-surface)",
          }}>
            <BookOpen size={22} style={{ color: "var(--text-subtle)", marginBottom: "10px" }} />
            <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "4px" }}>
              {searchQuery ? `No results for "${searchQuery}"` : "No notebooks yet"}
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginBottom: "16px" }}>
              {searchQuery ? "Try a different search." : "Create a notebook to start grounding your AI research."}
            </p>
            {!searchQuery && (
              <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
                <Plus size={13} />
                Create Notebook
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
