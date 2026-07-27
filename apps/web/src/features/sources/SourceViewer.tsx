"use client";

import React from "react";
import { 
  X, 
  Trash2, 
  Download, 
  FileText, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileCode,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useDocument, useDeleteDocument } from "../../lib/hooks";
import { api } from "../../lib/api";

const YoutubeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

export function SourceViewer() {
  const { 
    selectedNotebook, 
    selectedDocumentId, 
    setSelectedDocumentId 
  } = useWorkspaceStore();

  const notebookId = selectedNotebook?.id || "";
  const documentId = selectedDocumentId || "";

  const { data: doc, isLoading, error } = useDocument(documentId ? documentId : null);
  const deleteDocMutation = useDeleteDocument(notebookId);

  const handleClose = () => {
    setSelectedDocumentId(null);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this source from your notebook? This will permanently remove its parsed vectors.")) {
      return;
    }
    try {
      await deleteDocMutation.mutateAsync(documentId);
      setSelectedDocumentId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
    }
  };

  // YouTube helper to get video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
  };

  if (!selectedDocumentId) return null;

  const fileProxyUrl = doc ? api.getDocumentFileProxyUrl(notebookId, doc.id) : "";
  const isYouTube = doc?.type === "URL" && doc.url && getYouTubeId(doc.url);
  const ytVideoId = isYouTube && doc?.url ? getYouTubeId(doc.url) : null;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-card)] border-l border-[var(--border-subtle)] overflow-hidden">
      
      {/* Viewer Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-canvas-subtle)]">
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
          <span className="text-accent-orange shrink-0">
            {doc?.type === "IMAGE" && <ImageIcon size={18} />}
            {doc?.type === "URL" && (isYouTube ? <YoutubeIcon size={18} className="text-red-500" /> : <LinkIcon size={18} />)}
            {doc?.type === "PDF" && <FileText size={18} />}
            {!["IMAGE", "URL", "PDF"].includes(doc?.type || "") && <FileText size={18} />}
          </span>
          <div className="overflow-hidden">
            <h3 className="text-xs font-extrabold text-[var(--text-primary)] truncate" title={doc?.title || "Loading document..."}>
              {doc?.title || "Loading..."}
            </h3>
            <span className="text-[0.68rem] text-[var(--text-muted)] font-semibold uppercase tracking-wider block mt-0.5">
              {doc?.type || "Source"} Viewer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {doc && (
            <button
              onClick={handleDelete}
              disabled={deleteDocMutation.isPending}
              className="p-1.5 rounded-lg bg-transparent border-none text-[var(--text-muted)] hover:text-red-500 cursor-pointer flex items-center justify-center hover:bg-red-500/5 transition-colors"
              title="Delete source"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center hover:bg-[var(--bg-surface-hover)] transition-colors"
            title="Close viewer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-accent-orange" />
            <span className="text-xs font-semibold text-[var(--text-muted)]">Retrieving parsed source content...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4 text-red-500 text-xs font-bold">
            Failed to load document: {error.message}
          </div>
        ) : !doc ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-xs">
            No document selected.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            
            {/* View Proxy Action Bar (for static files/PDFs/Images) */}
            {["PDF", "IMAGE", "TXT", "MD", "CSV", "JSON"].includes(doc.type) && (
              <div className="flex gap-2">
                <a 
                  href={fileProxyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn text-xs flex items-center gap-1.5 justify-center py-2 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] no-underline font-bold transition-colors shadow-sm"
                >
                  <Download size={14} />
                  Open Original Document
                </a>
              </div>
            )}

            {/* Render Specific Media Viewers */}
            
            {/* 1. Image Viewer + visual OCR Transcription */}
            {doc.type === "IMAGE" && (
              <div className="flex flex-col gap-4">
                <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-canvas-subtle)] max-h-[350px] flex items-center justify-center p-2">
                  <img 
                    src={fileProxyUrl} 
                    alt={doc.title} 
                    className="max-w-full max-h-[330px] object-contain rounded-lg"
                  />
                </div>
                <div className="border border-[var(--border-subtle)] rounded-2xl p-4 bg-[var(--bg-canvas-subtle)]">
                  <h4 className="text-[0.72rem] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3 border-b border-[var(--border-subtle)] pb-2">
                    Visual Transcription (OCR & Chart Data)
                  </h4>
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
                    {doc.content || "Processing image transcription..."}
                  </p>
                </div>
              </div>
            )}

            {/* 2. YouTube Embed Video Player + Transcript */}
            {isYouTube && ytVideoId && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-black shadow-sm aspect-video">
                  <iframe 
                    src={`https://www.youtube.com/embed/${ytVideoId}`}
                    title={doc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                </div>
                <div className="border border-[var(--border-subtle)] rounded-2xl p-4 bg-[var(--bg-canvas-subtle)]">
                  <h4 className="text-[0.72rem] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3 border-b border-[var(--border-subtle)] pb-2">
                    Video Subtitles & Transcript
                  </h4>
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
                    {doc.content || "Transcript is empty or currently processing."}
                  </p>
                </div>
              </div>
            )}

            {/* 3. External Web URL scraper */}
            {doc.type === "URL" && !isYouTube && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3.5 border border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-canvas-subtle)]">
                  <span className="text-[0.78rem] text-[var(--text-muted)] font-semibold truncate flex-1 mr-3">
                    Scraped Link: {doc.url}
                  </span>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="shrink-0 text-xs font-bold text-accent-orange hover:text-accent-orange-hover flex items-center gap-1 no-underline"
                  >
                    Visit Page
                    <ExternalLink size={13} />
                  </a>
                </div>
                <div className="border border-[var(--border-subtle)] rounded-2xl p-4 bg-[var(--bg-canvas-subtle)]">
                  <h4 className="text-[0.72rem] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3 border-b border-[var(--border-subtle)] pb-2">
                    Extracted Web Article Text
                  </h4>
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
                    {doc.content || "Empty content scraped from URL."}
                  </p>
                </div>
              </div>
            )}

            {/* 4. Text Clips & Notes */}
            {!["IMAGE", "URL"].includes(doc.type) && (
              <div className="border border-[var(--border-subtle)] rounded-2xl p-5 bg-[var(--bg-canvas-subtle)] shadow-inner">
                <h4 className="text-[0.72rem] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3 border-b border-[var(--border-subtle)] pb-2">
                  Document Text Body
                </h4>
                {doc.type === "JSON" || doc.type === "CSV" ? (
                  <pre className="text-[0.72rem] leading-relaxed text-[var(--text-secondary)] bg-[var(--bg-canvas)] p-3.5 rounded-xl overflow-x-auto font-mono">
                    {doc.content || ""}
                  </pre>
                ) : (
                  <p className="text-[0.78rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
                    {doc.content || "No textual data found in document."}
                  </p>
                )}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
