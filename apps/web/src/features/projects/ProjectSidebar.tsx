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

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const { setCenterPanelMode, selectedDocumentId, setSelectedDocumentId } = useWorkspaceStore();
  const { data: documents = [], isLoading } = useDocuments(projectId);
  const deleteMutation = useDeleteDocument(projectId);

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
    <div className="w-full h-full flex flex-col bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="p-[12px_14px_10px] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-[0.78rem] font-semibold text-[var(--text-primary)] tracking-[0.01em]">
          Sources
        </span>
        <span className="text-[0.68rem] text-[var(--text-subtle)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-[6px] py-[1px] rounded-[var(--radius-sm)]">
          {documents.length}
        </span>
      </div>

      {/* Add source button */}
      <div className="p-[10px_12px_8px] flex gap-[6px]">
        <button
          onClick={() => { setCenterPanelMode("add-source"); setSelectedDocumentId(null); }}
          className="flex-1 py-[6px] rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-transparent text-[var(--text-secondary)] text-[0.78rem] font-medium flex items-center justify-center gap-[5px] cursor-pointer transition-colors hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]"
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
            className="px-[10px] py-[6px] rounded-[var(--radius-md)] border border-[var(--status-error-bg)] bg-[var(--status-error-bg)] text-[var(--status-error-text)] flex items-center justify-center cursor-pointer transition-colors"
            title="Clear all sources"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        
        {documents.length > 0 && (
          <div className="p-1 mb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-[26px] pr-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] text-[0.75rem]"
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={16} className="text-[var(--text-subtle)] animate-[spin_1s_linear_infinite]" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-7 px-4">
            <div className="w-[36px] h-[44px] mx-auto mb-3 border-[1.5px] border-dashed border-[var(--border-medium)] rounded-[var(--radius-md)] flex items-center justify-center">
              <FileText size={16} className="text-[var(--text-subtle)]" />
            </div>
            <p className="text-[0.78rem] font-medium text-[var(--text-secondary)] mb-1">
              No sources yet
            </p>
            <p className="text-[0.72rem] text-[var(--text-subtle)] leading-[1.5] mb-[10px]">
              Add files, websites, or more to ground your AI.
            </p>
            <button
              onClick={() => setCenterPanelMode("add-source")}
              className="text-[0.72rem] text-[var(--accent-orange)] bg-transparent border-none cursor-pointer underline decoration-[rgba(232,82,31,0.3)]"
            >
              Add a source
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-[1px]">
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
                <div key={folder} className="mb-2">
                  {folder !== "General" && (
                    <div 
                      onClick={() => setExpandedFolders(prev => ({ ...prev, [folder]: !isExpanded }))}
                      className="flex items-center gap-1 px-2 py-1 text-[var(--text-subtle)] text-[0.7rem] font-semibold uppercase tracking-[0.02em] cursor-pointer select-none"
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <Folder size={10} />
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">{folder.split('/').pop()}</span>
                    </div>
                  )}
                  {isExpanded && docs.map((doc: any) => {
                    const isSelected = selectedDocumentId === doc.id;
                    const isPending = doc.status === "PENDING" || doc.status === "PROCESSING";
                    const isFailed = doc.status === "FAILED";

                    return (
                      <div
                        key={doc.id}
                        className={`group flex items-center gap-[7px] px-2 py-[6px] rounded-[var(--radius-md)] border cursor-pointer transition-colors ${isSelected ? 'bg-[var(--bg-canvas)] border-[var(--border-medium)]' : 'bg-transparent border-transparent hover:bg-[var(--bg-canvas)]'}`}
                        onClick={() => { 
                          setSelectedDocumentId(doc.id); 
                          if (doc.studioFeature) {
                            setCenterPanelMode("studio");
                          } else {
                            setCenterPanelMode("chat");
                          }
                        }}
                      >
                        <span className={`shrink-0 ${isSelected ? 'text-[var(--accent-orange)]' : 'text-[var(--text-subtle)]'}`}>
                          {getDocIcon(doc)}
                        </span>
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <span className={`text-[0.78rem] truncate ${isSelected ? 'font-medium text-[var(--text-primary)]' : 'font-normal text-[var(--text-secondary)]'}`}>
                            {doc.title}
                          </span>
                          {isPending && doc.progressMessage && (
                            <span className="text-[0.65rem] text-[var(--status-warning-text)] mt-[1px] truncate">
                              {doc.progressMessage}
                            </span>
                          )}
                        </div>
                        {/* Status dot */}
                        <span 
                          title={isPending ? (doc.progressMessage || "Processing...") : isFailed ? "Failed" : "Ready"}
                          className={`w-[5px] h-[5px] rounded-full shrink-0 cursor-help ${isPending ? 'bg-[#FBBF24] animate-[pulse_1.5s_ease-in-out_infinite]' : isFailed ? 'bg-[var(--status-error-text)]' : 'bg-[#34D399]'}`}
                        />
                        {/* Delete on hover */}
                        <button
                          onClick={async e => {
                            e.stopPropagation();
                            if (confirm(`Delete "${doc.title}"?`)) {
                              await deleteMutation.mutateAsync(doc.id);
                              if (isSelected) setSelectedDocumentId(null);
                            }
                          }}
                          className="flex p-[2px] bg-transparent border-none cursor-pointer text-[var(--text-subtle)] hover:text-[var(--status-error-text)] opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 transition-opacity"
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
    </div>
  );
}
