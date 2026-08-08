"use client";

import React, { useEffect } from "react";
import { FileText, Image as ImageIcon, Link, Trash2, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import { useDocuments, useDeleteDocument } from "../../lib/hooks";
import { DocumentItem } from "@repo/shared";

export function SourceList({ projectId }: { projectId: string }) {
  const { data: documents = [], refetch: onRefresh } = useDocuments(projectId);
  const deleteDocumentMutation = useDeleteDocument(projectId);

  const handleDeleteDocument = async (docId: string) => {
    if (!projectId) return;
    await deleteDocumentMutation.mutateAsync(docId);
  };

  // Auto-poll status for documents in PENDING or PROCESSING state
  useEffect(() => {
    if (!projectId) return;
    const pendingDocs = documents.filter(d => d.status === "PENDING" || d.status === "PROCESSING");
    if (pendingDocs.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      for (const doc of pendingDocs) {
        try {
          const { status, progressMessage } = await api.getDocumentStatus(projectId, doc.id);
          if (status !== doc.status || progressMessage !== doc.progressMessage) {
            hasChanges = true;
          }
        } catch {
          // ignore
        }
      }
      if (hasChanges) {
        onRefresh();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [projectId, documents, onRefresh]);

  const getIcon = (type: string) => {
    if (type === "IMAGE") return <ImageIcon size={18} className="text-[var(--status-warning-text)]" />;
    if (type === "URL") return <Link size={18} className="text-[var(--accent-blue)]" />;
    return <FileText size={18} className="text-[var(--status-info-text)]" />;
  };

  const getStatusBadge = (doc: DocumentItem) => {
    const { status, progressMessage } = doc;
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[var(--status-success-bg)] text-[var(--status-success-text)] text-[0.72rem] font-semibold">
          <CheckCircle2 size={12} />
          Ready
        </span>
      );
    }
    if (status === "PROCESSING" || status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] text-[0.72rem] font-semibold" title={progressMessage || "Processing..."}>
          <RefreshCw size={12} className="spin" />
          {progressMessage ? progressMessage.slice(0, 30) + (progressMessage.length > 30 ? '...' : '') : "Processing"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full bg-[var(--status-error-bg)] text-[var(--status-error-text)] text-[0.72rem] font-semibold">
        <AlertCircle size={12} />
        Failed
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {documents.length > 0 && (
        <div className="flex justify-end mb-1">
          <button 
            onClick={async () => {
              if (confirm(`Are you sure you want to delete ALL ${documents.length} sources?`)) {
                for (const doc of documents) {
                  await handleDeleteDocument(doc.id);
                }
                onRefresh();
              }
            }}
            className="btn btn-ghost text-[0.82rem] text-[var(--status-error-text)] px-3 py-[6px] border border-[var(--status-error-bg)] rounded-[var(--radius-md)] bg-[var(--status-error-bg)] flex items-center gap-[6px]"
          >
            <Trash2 size={14} />
            Delete All Sources
          </button>
        </div>
      )}
      {documents.length > 0 ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center justify-between shadow-[var(--shadow-sm)] transition-all hover:border-[var(--accent-orange)]"
          >
            <div className="flex items-center gap-[14px] overflow-hidden">
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--bg-canvas-subtle)] flex items-center justify-center shrink-0">
                {getIcon(doc.type)}
              </div>

              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[0.92rem] font-semibold text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
                    {doc.title}
                  </span>
                  {getStatusBadge(doc)}
                </div>

                <span className="text-[0.78rem] text-[var(--text-muted)] mt-[2px]">
                  {doc.relativePath && <span className="font-medium text-[var(--text-secondary)]">{doc.relativePath} • </span>}
                  {doc.type} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Text note"} • {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {doc.status === "COMPLETED" && (
                <a
                  href={api.getDocumentFileProxyUrl(projectId, doc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost px-[10px] py-[6px] text-[0.8rem]"
                  title="Preview / Download Source"
                >
                  <ExternalLink size={15} />
                  <span>View</span>
                </a>
              )}

              <button
                onClick={() => {
                  if (confirm(`Remove "${doc.title}" from notebook?`)) {
                    handleDeleteDocument(doc.id);
                  }
                }}
                className="btn btn-ghost p-[6px] text-[var(--text-muted)] hover:text-[var(--status-error-text)]"
                title="Delete Source"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="p-9 text-center bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-muted)] text-[0.88rem]">
          No sources added yet. Click "Add Source" to upload files, links, or notes.
        </div>
      )}
    </div>
  );
}
