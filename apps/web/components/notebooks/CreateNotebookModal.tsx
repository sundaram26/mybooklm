"use client";

import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}

export function CreateNotebookModal({ isOpen, onClose, onCreate }: CreateNotebookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await onCreate(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      alert("Failed to create notebook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-blue-light)", color: "var(--accent-blue)" }}>
              <FolderPlus size={20} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)" }}>New Research Notebook</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Notebook Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gut Health & Biology, UX Research..."
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of research focus or sources..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Creating..." : "Create Notebook"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
