"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ChatInterface } from "../../../features/chat/ChatInterface";
import { AddSourceGrid } from "../../../features/sources/AddSourceGrid";
import { SourceViewer } from "../../../features/sources/SourceViewer";
import { StudioPanel } from "../../../features/projects/StudioPanel";
import { StudioContentViewer } from "../../../features/projects/StudioContentViewer";
import { CustomizeStudioModal } from "../../../features/projects/CustomizeStudioModal";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import { useDocuments } from "../../../lib/hooks";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { 
    centerPanelMode, setCenterPanelMode,
    selectedDocumentId, customizingStudioFeature, setCustomizingStudioFeature 
  } = useWorkspaceStore();

  const { data: documents = [] } = useDocuments(projectId);

  const selectedDoc = documents.find(d => d.id === selectedDocumentId);
  const activeStudioDoc = selectedDoc?.studioFeature ? selectedDoc : null;
  const hasStudioFeature = !!activeStudioDoc;

  return (
    <>
      <div className="flex-1 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] flex flex-col overflow-hidden">
        {/* Top tab switcher */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)] px-3 py-[6px] gap-2 items-center">
          <button 
            onClick={() => setCenterPanelMode("chat")}
            className={`px-3 py-[6px] text-[0.78rem] rounded-[var(--radius-md)] cursor-pointer transition-colors ${
              centerPanelMode === "chat" 
                ? "font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]" 
                : "font-medium text-[var(--text-muted)] bg-transparent border border-transparent hover:text-[var(--text-primary)]"
            }`}
          >
            Chat
          </button>
          {hasStudioFeature && (
            <button 
              onClick={() => setCenterPanelMode("studio")}
              className={`px-3 py-[6px] text-[0.78rem] rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                centerPanelMode === "studio" 
                  ? "font-semibold text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]" 
                  : "font-medium text-[var(--text-muted)] bg-transparent border border-transparent hover:text-[var(--text-primary)]"
              }`}
            >
              {activeStudioDoc.title}
            </button>
          )}
          {centerPanelMode === "add-source" && (
            <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">
              Add Source
            </span>
          )}
        </div>

        {centerPanelMode === "add-source" ? (
          <AddSourceGrid projectId={projectId} />
        ) : centerPanelMode === "studio" && activeStudioDoc ? (
          <StudioContentViewer doc={activeStudioDoc} />
        ) : (
          <ChatInterface projectId={projectId} />
        )}
      </div>

      <div className="w-[260px] shrink-0 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] flex flex-col overflow-hidden">
        {(selectedDocumentId && !hasStudioFeature) ? <SourceViewer documentId={selectedDocumentId} projectId={projectId} /> : <StudioPanel projectId={projectId} />}
      </div>
      
      <CustomizeStudioModal
        isOpen={customizingStudioFeature !== null}
        feature={customizingStudioFeature}
        onClose={() => setCustomizingStudioFeature(null)}
        projectId={projectId}
      />
    </>
  );
}
