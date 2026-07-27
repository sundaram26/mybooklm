"use client";

import React, { useState } from "react";
import { X, Upload, Link, FileText, Sparkles, Image as ImageIcon } from "lucide-react";
import { api } from "../../lib/api";

import { useWorkspaceStore } from "../../store/workspaceStore";
import { useUploadFile, useUploadUrl, useCreateTextNote } from "../../lib/hooks";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSourceModal({ isOpen, onClose }: AddSourceModalProps) {
  const { selectedNotebook } = useWorkspaceStore();
  const notebookId = selectedNotebook?.id || "";

  const uploadFileMutation = useUploadFile(notebookId);
  const uploadUrlMutation = useUploadUrl(notebookId);
  const createTextNoteMutation = useCreateTextNote(notebookId);

  const [tab, setTab] = useState<"file" | "url" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [text, setText] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !notebookId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "file") {
        if (!file) return;
        await uploadFileMutation.mutateAsync(file);
      } else if (tab === "url") {
        if (!url.trim()) return;
        await uploadUrlMutation.mutateAsync({ url: url.trim(), title: urlTitle.trim() || undefined });
      } else if (tab === "text") {
        if (!text.trim() || !textTitle.trim()) return;
        await createTextNoteMutation.mutateAsync({ text: text.trim(), title: textTitle.trim() });
      }
      onClose();
      // Reset form
      setFile(null);
      setUrl("");
      setUrlTitle("");
      setText("");
      setTextTitle("");
    } catch (err: any) {
      alert(err.message || "Failed to add source");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
              <Upload size={20} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>Add Source to Notebook</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
          <button
            onClick={() => setTab("file")}
            className={`btn ${tab === "file" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <Upload size={15} />
            <span>Upload File / Image</span>
          </button>
          <button
            onClick={() => setTab("url")}
            className={`btn ${tab === "url" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <Link size={15} />
            <span>Web Link URL</span>
          </button>
          <button
            onClick={() => setTab("text")}
            className={`btn ${tab === "text" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <FileText size={15} />
            <span>Copied Text Note</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tab === "file" && (
            <div style={{
              border: "2px dashed var(--border-medium)",
              borderRadius: "var(--radius-lg)",
              padding: "36px 20px",
              textAlign: "center",
              backgroundColor: "var(--bg-canvas-subtle)",
              cursor: "pointer"
            }}>
              <input
                type="file"
                id="source-file-input"
                accept=".pdf,.txt,.md,.csv,.json,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <label htmlFor="source-file-input" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                <Upload size={32} style={{ color: "var(--accent-blue)" }} />
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
                  {file ? file.name : "Click to browse or drag file here"}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Supports PDF, TXT, MD, CSV, JSON, PNG, JPG, WEBP (Max 50MB)
                </span>
              </label>
            </div>
          )}

          {tab === "url" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Web Page URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/article..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Source Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Custom title..."
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>
            </>
          )}

          {tab === "text" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Key research notes..."
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Text Content *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste research text or transcript content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-canvas)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Processing..." : "Add Source"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
