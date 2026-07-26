"use client";

import React, { useEffect } from "react";
import { FileText, Image as ImageIcon, Link, Trash2, ExternalLink, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { DocumentItem, api } from "../../lib/api-client";

interface SourceListProps {
  notebookId: string;
  documents: DocumentItem[];
  onRefresh: () => void;
  onDeleteDocument: (docId: string) => void;
}

export function SourceList({ notebookId, documents, onRefresh, onDeleteDocument }: SourceListProps) {
  // Auto-poll status for documents in PENDING or PROCESSING state
  useEffect(() => {
    const pendingDocs = documents.filter(d => d.status === "PENDING" || d.status === "PROCESSING");
    if (pendingDocs.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      for (const doc of pendingDocs) {
        try {
          const { status } = await api.getDocumentStatus(notebookId, doc.id);
          if (status !== doc.status) {
            hasChanges = true;
          }
        } catch {
          // ignore
        }
      }
      if (hasChanges) {
        onRefresh();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [notebookId, documents, onRefresh]);

  const getIcon = (type: string) => {
    if (type === "IMAGE") return <ImageIcon size={18} style={{ color: "var(--status-warning-text)" }} />;
    if (type === "URL") return <Link size={18} style={{ color: "var(--accent-blue)" }} />;
    return <FileText size={18} style={{ color: "var(--status-info-text)" }} />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "COMPLETED") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "var(--status-success-bg)", color: "var(--status-success-text)", fontSize: "0.72rem", fontWeight: "600" }}>
          <CheckCircle2 size={12} />
          Ready
        </span>
      );
    }
    if (status === "PROCESSING" || status === "PENDING") {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning-text)", fontSize: "0.72rem", fontWeight: "600" }}>
          <RefreshCw size={12} className="spin" />
          Processing
        </span>
      );
    }
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "var(--status-error-bg)", color: "var(--status-error-text)", fontSize: "0.72rem", fontWeight: "600" }}>
        <AlertCircle size={12} />
        Failed
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {documents.length > 0 ? (
        documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "var(--shadow-sm)",
              transition: "all var(--transition-fast)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px", overflow: "hidden" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-canvas-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {getIcon(doc.type)}
              </div>

              <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.92rem", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.title}
                  </span>
                  {getStatusBadge(doc.status)}
                </div>

                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {doc.type} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Text note"} • {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {doc.status === "COMPLETED" && (
                <a
                  href={api.getDocumentFileProxyUrl(notebookId, doc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                  style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                  title="Preview / Download Source"
                >
                  <ExternalLink size={15} />
                  <span>View</span>
                </a>
              )}

              <button
                onClick={() => {
                  if (confirm(`Remove "${doc.title}" from notebook?`)) {
                    onDeleteDocument(doc.id);
                  }
                }}
                className="btn btn-ghost"
                style={{ padding: "6px", color: "var(--text-muted)" }}
                title="Delete Source"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{
          padding: "36px",
          textAlign: "center",
          backgroundColor: "var(--bg-surface)",
          border: "1px dashed var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          color: "var(--text-muted)",
          fontSize: "0.88rem"
        }}>
          No sources added yet. Click "Add Source" to upload files, links, or notes.
        </div>
      )}
    </div>
  );
}
