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
      <div style={{ flex: 1, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top tab switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas-subtle)", padding: "6px 12px", gap: "8px", alignItems: "center" }}>
          <button 
            onClick={() => setCenterPanelMode("chat")}
            style={{
              padding: "6px 12px", fontSize: "0.78rem",
              fontWeight: centerPanelMode === "chat" ? 600 : 500,
              color: centerPanelMode === "chat" ? "var(--text-primary)" : "var(--text-muted)",
              background: centerPanelMode === "chat" ? "var(--bg-surface)" : "transparent",
              border: "1px solid " + (centerPanelMode === "chat" ? "var(--border-subtle)" : "transparent"),
              borderRadius: "var(--radius-md)", cursor: "pointer"
            }}
          >
            Chat
          </button>
          {hasStudioFeature && (
            <button 
              onClick={() => setCenterPanelMode("studio")}
              style={{
                padding: "6px 12px", fontSize: "0.78rem",
                fontWeight: centerPanelMode === "studio" ? 600 : 500,
                color: centerPanelMode === "studio" ? "var(--text-primary)" : "var(--text-muted)",
                background: centerPanelMode === "studio" ? "var(--bg-surface)" : "transparent",
                border: "1px solid " + (centerPanelMode === "studio" ? "var(--border-subtle)" : "transparent"),
                borderRadius: "var(--radius-md)", cursor: "pointer"
              }}
            >
              {activeStudioDoc.title}
            </button>
          )}
          {centerPanelMode === "add-source" && (
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
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

      <div style={{ width: "260px", flexShrink: 0, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
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
