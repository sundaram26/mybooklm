"use client";

import React from "react";
import { Folder, Trash2, ArrowUpRight, FileText } from "lucide-react";
import { Notebook } from "../../lib/api";

interface NotebookCardProps {
  notebook: Notebook;
  onSelect: (notebook: Notebook) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

export function NotebookCard({ notebook, onSelect, onDelete, isActive }: NotebookCardProps) {
  const docCount = notebook.documents?.length || notebook._count?.documents || 0;
  const totalMB = (
    (notebook.documents || []).reduce((acc, doc) => acc + (doc.fileSize || 0), 0) / (1024 * 1024)
  ).toFixed(1);

  return (
    <div 
      className={`folder-card ${isActive ? "active" : ""}`}
      onClick={() => onSelect(notebook)}
    >
      {/* Top Bar: Folder Icon + Delete */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "var(--radius-md)",
          backgroundColor: isActive ? "var(--accent-blue)" : "var(--bg-canvas-subtle)",
          color: isActive ? "#FFFFFF" : "var(--accent-blue)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-sm)"
        }}>
          <Folder size={20} />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${notebook.title}"? All documents will be deleted.`)) {
              onDelete(notebook.id);
            }
          }}
          className="btn btn-ghost"
          style={{ padding: "6px", color: "var(--text-muted)" }}
          title="Delete Notebook"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <h4 style={{ 
          fontSize: "1.05rem", 
          fontWeight: "700", 
          color: "var(--text-primary)", 
          marginBottom: "6px",
          lineHeight: "1.3"
        }}>
          {notebook.title}
        </h4>
        <p style={{ 
          fontSize: "0.82rem", 
          color: "var(--text-muted)", 
          display: "-webkit-box", 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: "vertical", 
          overflow: "hidden" 
        }}>
          {notebook.description || "Grounded research notebook with multi-format AI synthesis."}
        </p>
      </div>

      {/* Footer Metrics */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        fontSize: "0.78rem", 
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <FileText size={13} />
          <span>{docCount} {docCount === 1 ? "source" : "sources"}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
          <span>{totalMB} MB</span>
          <ArrowUpRight size={14} style={{ color: "var(--accent-blue)" }} />
        </div>
      </div>
    </div>
  );
}
