"use client";

import React, { useState } from "react";
import { 
  FileText, 
  AlignLeft, 
  FileCode, 
  Link as LinkIcon, 
  ArrowLeft, 
  Upload, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useUploadFile, useUploadUrl, useCreateTextNote } from "../../lib/hooks";

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

export function AddSourceGrid() {
  const { selectedNotebook, setCenterPanelMode } = useWorkspaceStore();
  const notebookId = selectedNotebook?.id || "";

  const uploadFileMutation = useUploadFile(notebookId);
  const uploadUrlMutation = useUploadUrl(notebookId);
  const createTextNoteMutation = useCreateTextNote(notebookId);

  // Active form view: null (show grid), or one of the form names
  const [activeForm, setActiveForm] = useState<"pdf" | "yt" | "text" | "vtt" | "web" | null>(null);
  
  // States for different inputs
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFormStates = () => {
    setFile(null);
    setUrl("");
    setUrlTitle("");
    setNoteTitle("");
    setNoteContent("");
    setError(null);
    setLoading(false);
  };

  const handleBackToGrid = () => {
    setActiveForm(null);
    resetFormStates();
  };

  const handleUploadFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      await uploadFileMutation.mutateAsync(selectedFile);
      setCenterPanelMode("chat");
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      setLoading(false);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await uploadUrlMutation.mutateAsync({ url: url.trim(), title: urlTitle.trim() || undefined });
      setCenterPanelMode("chat");
    } catch (err: any) {
      setError(err.message || "Failed to process link");
      setLoading(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createTextNoteMutation.mutateAsync({ text: noteContent.trim(), title: noteTitle.trim() });
      setCenterPanelMode("chat");
    } catch (err: any) {
      setError(err.message || "Failed to create note");
      setLoading(false);
    }
  };

  if (!notebookId) return null;

  return (
    <div className="w-full max-w-[850px] mx-auto py-10 px-4 md:px-8 flex flex-col justify-center min-h-[60vh]">
      
      {/* Back to Chat header when in Grid view */}
      {!activeForm && (
        <div className="flex justify-between items-center mb-8 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              Add Sources to <span className="text-accent-orange font-bold">{selectedNotebook?.title}</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Select a format below to ingest content into your private research workspace.
            </p>
          </div>
          <button 
            onClick={() => setCenterPanelMode("chat")}
            className="btn btn-ghost text-xs font-semibold flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[var(--text-secondary)] hover:text-accent-orange transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Chat
          </button>
        </div>
      )}

      {/* Main Grid View matching Wireframe 1 */}
      {!activeForm && (
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
          {/* Left 2x2 Grid (PDF, YT Link, Text, VTT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* PDF / Document Card */}
            <div 
              onClick={() => setActiveForm("pdf")}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-accent-orange/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-orange-light text-accent-orange flex items-center justify-center border border-accent-orange/10 mb-4 transition-colors">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] group-hover:text-accent-orange transition-colors flex items-center gap-1">
                  PDF / Word
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[0.76rem] text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
                  Upload PDFs, Word docs (.doc, .docx), plain text or images.
                </p>
              </div>
            </div>

            {/* YouTube Link Card */}
            <div 
              onClick={() => setActiveForm("yt")}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-accent-orange/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10 mb-4">
                <YoutubeIcon size={20} />
              </div>
              <div>
                <h3 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] group-hover:text-red-500 transition-colors flex items-center gap-1">
                  YT Video / Playlist
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[0.76rem] text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
                  Paste YouTube video or playlist URLs to index transcripts automatically.
                </p>
              </div>
            </div>

            {/* Text Clip Card */}
            <div 
              onClick={() => setActiveForm("text")}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-accent-orange/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/10 mb-4">
                <AlignLeft size={20} />
              </div>
              <div>
                <h3 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors flex items-center gap-1">
                  Text Clip
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[0.76rem] text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
                  Create notes, copy-paste clipboard paragraphs or articles.
                </p>
              </div>
            </div>

            {/* VTT Transcript Card */}
            <div 
              onClick={() => setActiveForm("vtt")}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-accent-orange/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/10 mb-4">
                <FileCode size={20} />
              </div>
              <div>
                <h3 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors flex items-center gap-1">
                  VTT / SRT
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[0.76rem] text-[var(--text-muted)] mt-1.5 font-medium leading-relaxed">
                  Import subtitle files (.vtt, .srt) containing timestamped transcripts.
                </p>
              </div>
            </div>

          </div>

          {/* Right Taller Web Link Card */}
          <div 
            onClick={() => setActiveForm("web")}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-accent-orange/40 rounded-2xl p-6 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 min-h-[340px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-650 flex items-center justify-center border border-emerald-500/10 mb-4">
              <LinkIcon size={20} />
            </div>
            <div className="flex flex-col justify-end h-full">
              <h3 className="text-[0.98rem] font-extrabold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                Web Link
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-[0.76rem] text-[var(--text-muted)] mt-2 font-medium leading-relaxed">
                Provide article page web links. The backend parser extracts HTML body text, sanitizes content tags, and runs embeddings automatically.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Sub-form Views */}
      {activeForm && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* Sub-form Header */}
          <div className="flex items-center gap-2 mb-6 text-sm text-[var(--text-muted)] font-semibold">
            <button 
              onClick={handleBackToGrid}
              className="p-1 rounded-lg hover:bg-[var(--bg-canvas-subtle)] border-none bg-transparent cursor-pointer flex items-center justify-center text-[var(--text-muted)] hover:text-accent-orange transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <span>Back to Source Options</span>
          </div>

          <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-6">
            {activeForm === "pdf" && "Upload Document (PDF, Word, Text, Image)"}
            {activeForm === "yt" && "Index YouTube Video or Playlist"}
            {activeForm === "text" && "Create Text Clip Note"}
            {activeForm === "vtt" && "Upload Subtitle Transcript File (.vtt, .srt)"}
            {activeForm === "web" && "Import Web Article URL"}
          </h3>

          {error && (
            <div className="p-3 mb-4 text-xs font-semibold bg-red-100 dark:bg-red-500/10 text-red-650 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Form Content */}
          {activeForm === "pdf" && (
            <div className="flex flex-col gap-6">
              <div className="border-2 border-dashed border-[var(--border-medium)] bg-[var(--bg-canvas-subtle)] rounded-2xl p-10 text-center relative group hover:border-accent-orange/40 transition-colors">
                <input 
                  type="file"
                  id="pdf-file-picker"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) handleUploadFile(selected);
                  }}
                  className="hidden"
                  disabled={loading}
                />
                <label htmlFor="pdf-file-picker" className="cursor-pointer flex flex-col items-center gap-3">
                  {loading ? (
                    <Loader2 size={36} className="text-accent-orange animate-spin" />
                  ) : (
                    <Upload size={36} className="text-accent-orange opacity-75 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="text-[0.92rem] font-bold text-[var(--text-primary)] mt-1">
                    {loading ? "Uploading and submitting..." : "Click to select a document"}
                  </span>
                  <span className="text-[0.74rem] text-[var(--text-muted)] leading-relaxed max-w-[280px]">
                    Supports PDF, DOC, DOCX, TXT, MD, CSV, JPG, PNG, WEBP (Max 50MB)
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeForm === "vtt" && (
            <div className="flex flex-col gap-6">
              <div className="border-2 border-dashed border-[var(--border-medium)] bg-[var(--bg-canvas-subtle)] rounded-2xl p-10 text-center relative group hover:border-accent-orange/40 transition-colors">
                <input 
                  type="file"
                  id="vtt-file-picker"
                  accept=".vtt,.srt"
                  multiple
                  // @ts-ignore - React doesn't officially type webkitdirectory yet
                  webkitdirectory="true"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setLoading(true);
                    setError(null);
                    try {
                      // Filter out macOS hidden metadata files (._*) and only accept true .vtt and .srt files
                      const validFiles = Array.from(files).filter(f => {
                        const isHiddenMacFile = f.name.startsWith('._') || (f.webkitRelativePath && f.webkitRelativePath.includes('__MACOSX'));
                        const isSubtitle = f.name.endsWith('.vtt') || f.name.endsWith('.srt');
                        return isSubtitle && !isHiddenMacFile;
                      });
                      
                      if (validFiles.length === 0) throw new Error("No valid .vtt or .srt files found in this folder");
                      for (const file of validFiles) {
                        await uploadFileMutation.mutateAsync(file);
                      }
                      setCenterPanelMode("chat");
                    } catch (err: any) {
                      setError(err.message || "Failed to upload folder files");
                      setLoading(false);
                    }
                  }}
                  className="hidden"
                  disabled={loading}
                />
                <label htmlFor="vtt-file-picker" className="cursor-pointer flex flex-col items-center gap-3">
                  {loading ? (
                    <Loader2 size={36} className="text-accent-orange animate-spin" />
                  ) : (
                    <Upload size={36} className="text-accent-orange opacity-75 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="text-[0.92rem] font-bold text-[var(--text-primary)] mt-1">
                    {loading ? "Uploading transcript folder..." : "Select subtitle folder"}
                  </span>
                  <span className="text-[0.74rem] text-[var(--text-muted)]">
                    Pick a folder containing subtitle files (.vtt, .srt)
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeForm === "yt" && (
            <form onSubmit={handleSubmitUrl} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">YouTube Video or Playlist URL</label>
                <input 
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or playlist?list=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Video Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="Custom label for video..."
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={handleBackToGrid} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary min-w-[120px]" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Ingesting...</span>
                  ) : "Index Video"}
                </button>
              </div>
            </form>
          )}

          {activeForm === "web" && (
            <form onSubmit={handleSubmitUrl} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Web Link URL</label>
                <input 
                  type="url"
                  required
                  placeholder="https://example.com/research-paper-details"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Article Title (Optional)</label>
                <input 
                  type="text"
                  placeholder="Custom article title..."
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={handleBackToGrid} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary min-w-[120px]" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Fetching...</span>
                  ) : "Import Link"}
                </button>
              </div>
            </form>
          )}

          {activeForm === "text" && (
            <form onSubmit={handleSubmitNote} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Note Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Inception-V4 Core Discoveries"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Content</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Type or paste your text notes here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl outline-none text-[0.88rem] text-[var(--text-primary)] focus:border-accent-orange resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={handleBackToGrid} className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary min-w-[120px]" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Saving...</span>
                  ) : "Save Clip"}
                </button>
              </div>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
