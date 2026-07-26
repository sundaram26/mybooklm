"use client";

import React from "react";
import { Plus, FolderPlus, Search, Filter } from "lucide-react";
import { Notebook } from "../../lib/api-client";
import { NotebookCard } from "./NotebookCard";

interface NotebookGridProps {
  notebooks: Notebook[];
  onSelectNotebook: (notebook: Notebook) => void;
  onDeleteNotebook: (id: string) => void;
  onOpenCreateModal: () => void;
  searchQuery: string;
}

export function NotebookGrid({
  notebooks,
  onSelectNotebook,
  onDeleteNotebook,
  onOpenCreateModal,
  searchQuery,
}: NotebookGridProps) {
  const filteredNotebooks = notebooks.filter(nb =>
    nb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nb.description && nb.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
      {/* Dashboard Title & Top Action Bar matching Image 2 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Projects & Research Notebooks
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Grounded multi-source research folders with AI synthesis.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ padding: "10px 20px" }}>
            <Plus size={16} />
            <span>New Notebook</span>
          </button>
        </div>
      </div>

      {/* Grid of Folder Cards matching Image 2 */}
      {filteredNotebooks.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "24px"
        }}>
          {filteredNotebooks.map(notebook => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              onSelect={onSelectNotebook}
              onDelete={onDeleteNotebook}
            />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "60px 20px",
          textAlign: "center",
          backgroundColor: "var(--bg-surface)",
          border: "2px dashed var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          marginTop: "20px"
        }}>
          <FolderPlus size={44} style={{ color: "var(--text-muted)" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>No notebooks created yet</h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "380px" }}>
            {searchQuery ? `No notebooks matching "${searchQuery}"` : "Get started by creating your first grounded research notebook."}
          </p>
          <button onClick={onOpenCreateModal} className="btn btn-primary" style={{ marginTop: "8px" }}>
            <Plus size={16} />
            <span>Create Notebook</span>
          </button>
        </div>
      )}
    </div>
  );
}
