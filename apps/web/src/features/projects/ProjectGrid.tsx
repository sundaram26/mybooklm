"use client";

import React from "react";
import { Plus, BookOpen, Trash2, FileText, Clock } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useProjects, useDeleteProject, useCreateProject } from "../../lib/hooks";
import { formatRelativeTime } from "../../lib/utils";
import { useRouter } from "next/navigation";
import { ProjectWithCounts } from "@repo/shared";

interface ProjectGridProps {
  searchQuery?: string;
}

export function ProjectGrid({ searchQuery = "" }: ProjectGridProps) {
  const { setCreateModalOpen } = useWorkspaceStore();
  const { data: projects = [], isLoading } = useProjects();
  const deleteMutation = useDeleteProject();
  const router = useRouter();

  const open = (nb: ProjectWithCounts) => { 
    router.push(`/project/${nb.id}`);
  };

  const del = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Delete "${title}"?`)) await deleteMutation.mutateAsync(id);
  };

  const filtered = projects.filter(nb =>
    nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nb.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-[960px] mx-auto py-7 px-8">

        {/* Page header */}
        <div className="flex items-center justify-between text-[0.8125rem] font-medium text-[var(--text-secondary)] mb-5">
          <div>
            <h1 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-[2px] font-[family-name:var(--font-heading)]">
              Projects
            </h1>
            <p className="text-[0.8125rem] text-[var(--text-muted)]">
              {projects.length} project{projects.length !== 1 ? "s" : ""} · grounded AI research workspace
            </p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn btn-secondary"
            >
              <Plus size={13} />
              New Project
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="w-full border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-12 bg-[var(--bg-surface)] animate-[pulse_1.5s_ease-in-out_infinite] ${i < 3 ? 'border-b border-[var(--border-subtle)]' : ''}`} style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && filtered.length > 0 && (
          <div className="w-full border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_100px_90px_36px] px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <span className="py-2 text-[0.68rem] font-semibold tracking-[0.06em] uppercase text-[var(--text-subtle)]">Name</span>
              <span className="py-2 text-[0.68rem] font-semibold tracking-[0.06em] uppercase text-[var(--text-subtle)] text-right">Sources</span>
              <span className="py-2 text-[0.68rem] font-semibold tracking-[0.06em] uppercase text-[var(--text-subtle)] text-right">Updated</span>
              <span className="py-2 text-[0.68rem] font-semibold tracking-[0.06em] uppercase text-[var(--text-subtle)]" />
            </div>

            {/* Data rows */}
            {filtered.map((nb, idx) => {
              const docCount = (nb as ProjectWithCounts)._count?.documents ?? (nb as ProjectWithCounts).documents?.length ?? 0;
              const isLast   = idx === filtered.length - 1;

              return (
                <div
                  key={nb.id}
                  onClick={() => open(nb)}
                  className={`grid grid-cols-[1fr_100px_90px_36px] items-center px-4 min-h-[48px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] cursor-pointer transition-colors ${!isLast ? 'border-b border-[var(--border-subtle)]' : ''}`}
                >
                  {/* Name + description */}
                  <div className="flex items-center gap-[10px] pr-3 overflow-hidden">
                    <BookOpen size={14} className="text-[var(--text-subtle)] shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-[0.8125rem] font-medium text-[var(--text-primary)] truncate">
                        {nb.title}
                      </div>
                      {nb.description && (
                        <div className="text-[0.7rem] text-[var(--text-subtle)] truncate">
                          {nb.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="flex items-center justify-end gap-[5px] text-right">
                    <FileText size={11} className="text-[var(--text-subtle)]" />
                    <span className="text-[0.78rem] text-[var(--text-muted)]">{docCount}</span>
                  </div>

                  {/* Updated */}
                  <div className="flex items-center justify-end gap-[5px] text-right">
                    <Clock size={11} className="text-[var(--text-subtle)]" />
                    <span className="text-[0.72rem] text-[var(--text-muted)]">{formatRelativeTime(nb.updatedAt)}</span>
                  </div>

                  {/* Delete */}
                  <div className="flex justify-center">
                    <button
                      onClick={e => del(e, nb.id, nb.title)}
                      className="flex items-center p-1 rounded-[var(--radius-sm)] bg-transparent border-none cursor-pointer text-[var(--text-subtle)] hover:text-[var(--status-error-text)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state — compact */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-[10vh] px-6 py-9 text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
            <BookOpen size={24} className="text-[var(--text-subtle)] mb-3" />
            <p className="text-base font-semibold text-[var(--text-primary)] mb-1 font-[family-name:var(--font-heading)]">
              {searchQuery ? `No results for "${searchQuery}"` : "No projects yet"}
            </p>
            <p className="text-[0.8125rem] text-[var(--text-muted)] mb-5">
              {searchQuery ? "Try a different search." : "Create a project to start grounding your AI research."}
            </p>
            {!searchQuery && (
              <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
                <Plus size={13} />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
