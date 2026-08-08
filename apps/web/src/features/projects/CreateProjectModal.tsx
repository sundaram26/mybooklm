"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "../../lib/hooks";

export function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const createMutation = useCreateProject();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const reset = () => { setTitle(""); setDescription(""); setError(""); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    setLoading(true);
    try {
      const created = await createMutation.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
      reset();
      onClose();
      router.push(`/project/${created.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-canvas)",
    color: "var(--text-primary)", fontSize: "0.8125rem",
    outline: "none", transition: "border-color var(--transition-fast)",
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 120ms ease-out",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "420px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          animation: "slideUp 150ms ease-out",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-primary)" }}>
            New Project
          </h3>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: "2px" }}>
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "5px" }}>
                Name <span style={{ color: "var(--status-error-text)" }}>*</span>
              </label>
              <input
                type="text" required autoFocus
                placeholder="e.g. Gut Health Research"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={fieldStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--accent-orange)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border-subtle)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "5px" }}>
                Description <span style={{ color: "var(--text-subtle)", fontWeight: "400" }}>(optional)</span>
              </label>
              <textarea
                rows={2} placeholder="Brief context or purpose..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ ...fieldStyle, resize: "none", lineHeight: "1.5" }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent-orange)"}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border-subtle)"}
              />
            </div>

            {error && (
              <p style={{ fontSize: "0.76rem", color: "var(--status-error-text)", padding: "7px 10px", background: "var(--status-error-bg)", borderRadius: "var(--radius-md)" }}>
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn btn-primary"
              style={{ opacity: loading || !title.trim() ? 0.6 : 1 }}
            >
              {loading ? (
                <span style={{ width: "13px", height: "13px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              ) : null}
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
