"use client";

import React, { useState } from "react";
import {
  Sparkles, Plus, ChevronDown, Headphones, Presentation, PlaySquare,
  Network, FileText, LayoutTemplate, HelpCircle, PieChart, Table,
  Loader2, AlertCircle
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useGenerateStudio } from "../../lib/hooks";

const STUDIO_ITEMS = [
  { label: "Audio Overview",  slug: "audio-overview",  Icon: Headphones,     color: "var(--status-info-text)"    },
  { label: "Slide Deck",      slug: "slide-deck",      Icon: Presentation,   color: "var(--status-info-text)"    },
  { label: "Video Overview",  slug: "video-overview",  Icon: PlaySquare,     color: "var(--status-success-text)" },
  { label: "Mind Map",        slug: "mind-map",        Icon: Network,        color: "var(--status-success-text)" },
  { label: "Reports",         slug: "reports",         Icon: FileText,       color: "var(--status-warning-text)" },
  { label: "Flashcards",      slug: "flashcards",      Icon: LayoutTemplate, color: "var(--status-warning-text)" },
  { label: "Quiz",            slug: "quiz",            Icon: HelpCircle,     color: "var(--status-info-text)"    },
  { label: "Infographic",     slug: "infographic",     Icon: PieChart,       color: "var(--status-info-text)"    },
  { label: "Data Table",      slug: "data-table",      Icon: Table,          color: "var(--text-secondary)"      },
];

export function StudioPanel({ projectId }: { projectId: string }) {
  const { 
    setSelectedDocumentId,
    setCenterPanelMode,
    setCustomizingStudioFeature
  } = useWorkspaceStore();

  const generateStudioMutation = useGenerateStudio(projectId);

  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (slug: string) => {
    if (!projectId || generatingSlug) return;
    setGeneratingSlug(slug);
    setErrorMsg(null);

    try {
      const doc = await generateStudioMutation.mutateAsync({
        feature: slug,
      });
      // Automatically view the newly generated script / document!
      setSelectedDocumentId(doc.id);
      if (doc.studioFeature) {
        setCenterPanelMode("studio");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate studio output.");
    } finally {
      setGeneratingSlug(null);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-surface)", position: "relative" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={13} style={{ color: "var(--text-subtle)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>Studio</span>
        </div>
      </div>

      {/* Language selector */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 14px",
        borderBottom: "1px solid var(--border-subtle)",
        fontSize: "0.72rem", color: "var(--text-muted)",
        flexShrink: 0,
      }}>
        <span>Audio overview language:</span>
        <button style={{
          display: "flex", alignItems: "center", gap: "3px",
          background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)", borderRadius: "var(--radius-sm)",
          padding: "2px 7px", cursor: "pointer", fontSize: "0.72rem",
          transition: "all var(--transition-fast)",
        }}>
          English <ChevronDown size={11} />
        </button>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div style={{ 
          margin: "8px 12px 0", 
          padding: "8px 12px", 
          background: "rgba(239, 68, 68, 0.08)", 
          border: "1px solid rgba(239, 68, 68, 0.2)", 
          borderRadius: "var(--radius-md)", 
          display: "flex", 
          gap: "8px", 
          alignItems: "flex-start", 
          fontSize: "0.72rem", 
          color: "rgb(239, 68, 68)" 
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", paddingBottom: "64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {STUDIO_ITEMS.map(({ label, slug, Icon, color }) => {
            const isThisGenerating = generatingSlug === slug;
            const isAnyGenerating = generatingSlug !== null;

            return (
              <button
                key={label}
                disabled={isAnyGenerating || !projectId}
                onClick={() => setCustomizingStudioFeature(slug)}
                style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "6px", padding: "14px 8px",
                  background: isThisGenerating ? "var(--bg-surface-hover)" : "var(--bg-canvas)",
                  border: isThisGenerating ? "1px solid var(--accent-orange)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  cursor: (isAnyGenerating || !projectId) ? "not-allowed" : "pointer", 
                  transition: "all var(--transition-fast)",
                  color: isThisGenerating ? "var(--text-primary)" : "var(--text-secondary)",
                  gridColumn: label === "Data Table" ? "span 2" : "span 1",
                  opacity: (isAnyGenerating && !isThisGenerating) || !projectId ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!isAnyGenerating && projectId) { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-hover)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
                onMouseLeave={e => { if (!isAnyGenerating && projectId) { (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
              >
                {isThisGenerating ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-orange)" }} />
                ) : (
                  <Icon size={18} style={{ color }} />
                )}
                <span style={{ fontSize: "0.72rem", fontWeight: 500 }}>
                  {isThisGenerating ? "Generating..." : label}
                </span>
              </button>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: "14px" }}>
          {!projectId ? "Select a project to use the Studio." : "Studio output will be saved as notes here."}
        </p>
      </div>

      {/* Add note CTA */}
      <div style={{
        position: "absolute", bottom: "14px", left: 0, right: 0,
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}>
        <button style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "center", gap: "6px",
          padding: "7px 18px",
          background: "var(--bg-canvas)", border: "1px solid var(--border-medium)",
          borderRadius: "999px", color: "var(--text-secondary)",
          fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
          boxShadow: "var(--shadow-md)",
          transition: "all var(--transition-fast)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-surface-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          <Plus size={13} />
          Add note
        </button>
      </div>
    </div>
  );
}
