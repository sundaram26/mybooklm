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
    <div className="w-full h-full flex flex-col bg-[var(--bg-surface)] relative">
      {/* Header */}
      <div className="flex items-center justify-between p-[10px_14px] border-b border-[var(--border-subtle)] shrink-0">
        <div className="flex items-center gap-[6px]">
          <Sparkles size={13} className="text-[var(--text-subtle)]" />
          <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">Studio</span>
        </div>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-[6px] p-[8px_14px] border-b border-[var(--border-subtle)] text-[0.72rem] text-[var(--text-muted)] shrink-0">
        <span>Audio overview language:</span>
        <button className="flex items-center gap-[3px] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-[var(--radius-sm)] px-[7px] py-[2px] cursor-pointer text-[0.72rem] transition-all hover:bg-[var(--bg-surface-hover)]">
          English <ChevronDown size={11} />
        </button>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="flex items-start gap-2 mx-3 mt-2 p-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-[var(--radius-md)] text-[0.72rem] text-[rgb(239,68,68)]">
          <AlertCircle size={14} className="shrink-0 mt-[1px]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 pb-16">
        <div className="grid grid-cols-2 gap-[6px]">
          {STUDIO_ITEMS.map(({ label, slug, Icon, color }) => {
            const isThisGenerating = generatingSlug === slug;
            const isAnyGenerating = generatingSlug !== null;

            return (
              <button
                key={label}
                disabled={isAnyGenerating || !projectId}
                onClick={() => setCustomizingStudioFeature(slug)}
                className={`flex flex-col items-center justify-center gap-[6px] p-[14px_8px] rounded-[var(--radius-lg)] transition-all ${isThisGenerating ? 'bg-[var(--bg-surface-hover)] border border-[var(--accent-orange)] text-[var(--text-primary)]' : 'bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]'} ${label === "Data Table" ? 'col-span-2' : 'col-span-1'} ${((isAnyGenerating && !isThisGenerating) || !projectId) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isThisGenerating ? (
                  <Loader2 size={18} className="animate-spin text-[var(--accent-orange)]" />
                ) : (
                  <Icon size={18} style={{ color }} />
                )}
                <span className="text-[0.72rem] font-medium">
                  {isThisGenerating ? "Generating..." : label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[0.68rem] text-[var(--text-subtle)] mt-[14px]">
          {!projectId ? "Select a project to use the Studio." : "Studio output will be saved as notes here."}
        </p>
      </div>

      {/* Add note CTA */}
      <div className="absolute bottom-[14px] left-0 right-0 flex justify-center pointer-events-none">
        <button className="pointer-events-auto flex items-center gap-[6px] px-[18px] py-[7px] bg-[var(--bg-canvas)] border border-[var(--border-medium)] rounded-full text-[var(--text-secondary)] text-[0.78rem] font-medium cursor-pointer shadow-[var(--shadow-md)] transition-all hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]">
          <Plus size={13} />
          Add note
        </button>
      </div>
    </div>
  );
}
