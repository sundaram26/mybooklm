"use client";

import React from "react";
import { HardDrive, FileText, Image as ImageIcon, Clock, Activity, BookOpen, Zap } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useDocuments, useNotebooks } from "../../lib/hooks";

function StatRow({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "7px 0",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: "0.8125rem", fontWeight: "500", color: "var(--text-primary)", textAlign: "right" }}>
        {value}
        {sub && <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginLeft: "4px" }}>{sub}</span>}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: "0.625rem", fontWeight: "600", letterSpacing: "0.08em",
      textTransform: "uppercase", color: "var(--text-subtle)",
      marginBottom: "2px", marginTop: "16px",
    }}>
      {children}
    </p>
  );
}

export function RightInfoPanel() {
  const { selectedNotebook } = useWorkspaceStore();
  const { data: documents = [] } = useDocuments(selectedNotebook?.id);
  const { data: notebooks = [] } = useNotebooks();

  const totalBytes  = documents.reduce((a, d) => a + (d.fileSize || 0), 0);
  const totalMB     = (totalBytes / 1048576).toFixed(1);
  const storagePct  = Math.min(100, (totalBytes / 1073741824) * 100);
  const docCount    = documents.filter(d => d.type !== "IMAGE").length;
  const imgCount    = documents.filter(d => d.type === "IMAGE").length;
  const totalNbs    = notebooks.length;
  const totalSrcs   = notebooks.reduce((a, nb) => a + (nb._count?.documents ?? 0), 0);

  const CAP = [
    { label: "RAG Search",    dot: "#818CF8" },
    { label: "AI Synthesis",  dot: "var(--accent-orange)" },
    { label: "Multi-Format",  dot: "#34D399" },
    { label: "Grounded Chat", dot: "#06B6D4" },
  ];

  return (
    <aside style={{
      width: "var(--info-panel-width)", height: "100%",
      background: "var(--bg-canvas)",
      borderLeft: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflowY: "auto",
    }}>

      {/* Header */}
      <div style={{
        padding: "13px 16px 12px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <h3 style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-primary)" }}>
          Workspace
        </h3>
      </div>

      <div style={{ padding: "0 16px 16px", flex: 1 }}>

        {/* Overview stats */}
        <SectionTitle>Overview</SectionTitle>
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginTop: "6px" }}>
          <div style={{ background: "var(--bg-surface)" }}>
            <StatRow label="Notebooks" value={totalNbs} />
            <StatRow label="Total Sources" value={totalSrcs} />
            <div style={{ padding: "7px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Storage</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "60px", height: "3px", background: "var(--border-subtle)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${storagePct}%`, background: "var(--accent-orange)" }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{totalMB} MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active notebook */}
        {selectedNotebook && (
          <>
            <SectionTitle>Active Notebook</SectionTitle>
            <div style={{
              border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface)", overflow: "hidden", marginTop: "6px",
            }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent-orange)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: "500", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedNotebook.title}
                  </span>
                </div>
              </div>
              <div style={{ padding: "0 12px" }}>
                <StatRow label="Documents" value={docCount} />
                <StatRow label="Images" value={imgCount} />
                <StatRow label="Storage" value={`${totalMB} MB`} />
                <div style={{ padding: "7px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "2px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Created</span>
                    <span style={{ color: "var(--text-primary)" }}>{new Date(selectedNotebook.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Capabilities */}
        <SectionTitle>Capabilities</SectionTitle>
        <div style={{
          border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)",
          background: "var(--bg-surface)", marginTop: "6px",
        }}>
          {CAP.map(({ label, dot }, i) => (
            <div
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "7px 12px",
                borderBottom: i < CAP.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot, flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <SectionTitle>Quick Actions</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "6px" }}>
          {[
            { icon: Activity, label: "Activity log" },
            { icon: Zap,      label: "Quick actions" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "6px 8px", borderRadius: "var(--radius-md)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", fontSize: "0.78rem",
                width: "100%", textAlign: "left",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
