"use client";

import React from "react";
import { BookOpen, Copy, Settings, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { useDocuments } from "../../lib/hooks";
import { Project } from "@repo/shared";

export function ProjectHeader({ project }: { project: Project }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { data: documents = [] } = useDocuments(project?.id);

  return (
    <header style={{
      height: "52px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      background: "var(--bg-canvas)",
      borderBottom: "1px solid var(--border-subtle)",
      flexShrink: 0,
    }}>
      {/* Left: back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
        <button
          onClick={() => { router.push("/"); }}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.78rem", padding: "4px 6px",
            borderRadius: "var(--radius-md)",
            transition: "color var(--transition-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
        >
          <ChevronLeft size={14} />
          <span>Projects</span>
        </button>

        <div style={{ width: "1px", height: "16px", background: "var(--border-subtle)", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", gap: "7px", overflow: "hidden" }}>
          <div style={{
            width: "18px", height: "18px", borderRadius: "4px",
            background: "var(--accent-orange)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <BookOpen size={10} color="#fff" />
          </div>
          <span style={{
            fontSize: "0.84rem", fontWeight: 600, color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {project.title}
          </span>
        </div>

        <span style={{
          fontSize: "0.68rem", color: "var(--text-subtle)", flexShrink: 0,
          padding: "2px 6px", borderRadius: "var(--radius-sm)",
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
        }}>
          {documents.length} source{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "none", border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)", fontSize: "0.75rem",
            padding: "4px 10px", borderRadius: "var(--radius-md)",
            cursor: "pointer", transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <Copy size={12} /> Copy
        </button>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "none", border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)", fontSize: "0.75rem",
            padding: "4px 10px", borderRadius: "var(--radius-md)",
            cursor: "pointer", transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <Settings size={12} /> Settings
        </button>

        <div style={{ width: "1px", height: "16px", background: "var(--border-subtle)" }} />

        {/* Avatar */}
        <div style={{
          width: "24px", height: "24px", borderRadius: "50%",
          background: "var(--accent-orange)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.65rem", fontWeight: 700,
        }}>
          {user?.name?.[0]?.toUpperCase() || "G"}
        </div>
      </div>
    </header>
  );
}
