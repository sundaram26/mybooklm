"use client";

import React, { useState } from "react";
import {
  Plus, Globe, Search, FileText, FileCode,
  Image as ImageIcon, Link as LinkIcon, Loader2, Trash2, Folder, ChevronDown, ChevronRight
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useDocuments, useDeleteDocument } from "../../lib/hooks";

const YoutubeIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>
);

export function NotebookSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const { selectedNotebook, setCenterPanelMode, selectedDocumentId, setSelectedDocumentId } = useWorkspaceStore();
  const notebookId = selectedNotebook?.id || "";
  const { data: documents = [], isLoading } = useDocuments(notebookId || undefined);
  const deleteMutation = useDeleteDocument(notebookId);

  const getDocIcon = (doc: any) => {
    const t = doc.title?.toLowerCase() || "";
    if (doc.type === "IMAGE") return <ImageIcon size={13} />;
    if (doc.type === "URL") {
      if (t.includes("youtube") || t.includes("youtu.be")) return <YoutubeIcon size={13} />;
      return <LinkIcon size={13} />;
    }
    if (t.endsWith(".vtt") || t.endsWith(".srt")) return <FileCode size={13} />;
    return <FileText size={13} />;
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-surface)" }}>
      {/* Header */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "0.01em" }}>
          Sources
        </span>
        <span style={{
          fontSize: "0.68rem", color: "var(--text-subtle)",
          background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)",
          padding: "1px 6px", borderRadius: "var(--radius-sm)",
        }}>
          {documents.length}
        </span>
      </div>

      {/* Add source button */}
      <div style={{ padding: "10px 12px 8px", display: "flex", gap: "6px" }}>
        <button
          onClick={() => { setCenterPanelMode("add-source"); setSelectedDocumentId(null); }}
          style={{
            flex: 1, padding: "6px 0",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-medium)",
            background: "transparent", color: "var(--text-secondary)",
            fontSize: "0.78rem", fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            cursor: "pointer", transition: "all var(--transition-fast)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
        >
          <Plus size={13} />
          Add sources
        </button>
        
        {documents.length > 0 && (
          <button
            onClick={async () => {
              if (confirm(`Are you sure you want to delete ALL ${documents.length} sources?`)) {
                for (const doc of documents) {
                  await deleteMutation.mutateAsync(doc.id);
                }
                setSelectedDocumentId(null);
                setCenterPanelMode("chat");
              }
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--status-error-bg)",
              background: "var(--status-error-bg)", color: "var(--status-error-text)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all var(--transition-fast)",
            }}
            title="Clear all sources"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Document list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
        
        {documents.length > 0 && (
          <div style={{ padding: "4px", marginBottom: "8px" }}>
            <div style={{ position: "relative" }}>
              <Search size={12} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "4px 8px 4px 26px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-canvas)",
                  color: "var(--text-primary)",
                  fontSize: "0.75rem"
                }}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
            <Loader2 size={16} style={{ color: "var(--text-subtle)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 16px" }}>
            <div style={{
              width: "36px", height: "44px", margin: "0 auto 12px",
              border: "1.5px dashed var(--border-medium)", borderRadius: "var(--radius-md)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={16} style={{ color: "var(--text-subtle)" }} />
            </div>
            <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
              No sources yet
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", lineHeight: "1.5", marginBottom: "10px" }}>
              Add files, websites, or more to ground your AI.
            </p>
            <button
              onClick={() => setCenterPanelMode("add-source")}
              style={{
                fontSize: "0.72rem", color: "var(--accent-orange)",
                background: "none", border: "none", cursor: "pointer",
                textDecoration: "underline", textDecorationColor: "rgba(232,82,31,0.3)",
              }}
            >
              Add a source
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {(() => {
              const filteredDocs = documents.filter(doc => 
                (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                (doc.relativePath || "").toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              const grouped = filteredDocs.reduce((acc, doc) => {
                const folder = doc.relativePath ? doc.relativePath.substring(0, doc.relativePath.lastIndexOf('/')) : "General";
                if (!acc[folder]) acc[folder] = [];
                acc[folder].push(doc);
                return acc;
              }, {} as Record<string, any[]>);

              return Object.entries(grouped).map(([folder, docs]) => {
                const isExpanded = folder === "General" || expandedFolders[folder] !== false; // expanded by default
                
                return (
                <div key={folder} style={{ marginBottom: "8px" }}>
                  {folder !== "General" && (
                    <div 
                      onClick={() => setExpandedFolders(prev => ({ ...prev, [folder]: !isExpanded }))}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 8px", color: "var(--text-subtle)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", cursor: "pointer", userSelect: "none" }}
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <Folder size={10} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{folder.split('/').pop()}</span>
                    </div>
                  )}
                  {isExpanded && docs.map((doc: any) => {
                    const isSelected = selectedDocumentId === doc.id;
                    const isPending = doc.status === "PENDING" || doc.status === "PROCESSING";
                    const isFailed = doc.status === "FAILED";

                    return (
                      <div
                        key={doc.id}
                        style={{
                          display: "flex", alignItems: "center", gap: "7px",
                          padding: "6px 8px", borderRadius: "var(--radius-md)",
                          background: isSelected ? "var(--bg-canvas)" : "transparent",
                          border: `1px solid ${isSelected ? "var(--border-medium)" : "transparent"}`,
                          cursor: "pointer", transition: "all var(--transition-fast)",
                        }}
                        onClick={() => { 
                          setSelectedDocumentId(doc.id); 
                          if (doc.studioFeature) {
                            setCenterPanelMode("studio");
                          } else {
                            setCenterPanelMode("chat");
                          }
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--bg-canvas)"; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span style={{ color: isSelected ? "var(--accent-orange)" : "var(--text-subtle)", flexShrink: 0 }}>
                          {getDocIcon(doc)}
                        </span>
                        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <span style={{
                            fontSize: "0.78rem", fontWeight: isSelected ? 500 : 400,
                            color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {doc.title}
                          </span>
                          {isPending && doc.progressMessage && (
                            <span style={{ fontSize: "0.65rem", color: "var(--status-warning-text)", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.progressMessage}
                            </span>
                          )}
                        </div>
                        {/* Status dot */}
                        <span 
                          title={isPending ? (doc.progressMessage || "Processing...") : isFailed ? "Failed" : "Ready"}
                          style={{
                            width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                            background: isPending ? "#FBBF24" : isFailed ? "var(--status-error-text)" : "#34D399",
                            animation: isPending ? "pulse 1.5s ease-in-out infinite" : "none",
                            cursor: "help",
                        }} />
                        {/* Delete on hover */}
                        <button
                          onClick={async e => {
                            e.stopPropagation();
                            if (confirm(`Delete "${doc.title}"?`)) {
                              await deleteMutation.mutateAsync(doc.id);
                              if (isSelected) setSelectedDocumentId(null);
                            }
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-subtle)", padding: "2px", display: "flex",
                            opacity: 0, transition: "opacity var(--transition-fast)",
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--status-error-text)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-subtle)"; }}
                          onFocus={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                          onBlur={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}
                          title="Delete source"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )});
            })()}
          </div>
        )}
      </div>


      <style>{`.delete-btn { opacity: 0; } div:hover > .delete-btn { opacity: 1; }`}</style>
    </div>
  );
}
