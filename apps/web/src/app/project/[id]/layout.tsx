"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "../../../lib/hooks";
import { ProjectHeader } from "../../../features/projects/ProjectHeader";
import { ProjectSidebar } from "../../../features/projects/ProjectSidebar";
import { AuthModal } from "../../../features/auth/AuthModal";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import ProjectLoading from "./loading";

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isLoading, error } = useProject(id);
  const router = useRouter();

  const { isAuthModalOpen, setAuthModalOpen } = useWorkspaceStore();

  useEffect(() => {
    if (error) {
      // Handled by error.tsx
    }
  }, [error]);

  if (isLoading) return <ProjectLoading />;
  if (!project) return null; // Or handled by error.tsx

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <ProjectHeader project={project} />
      <div className="flex flex-1 p-[10px] gap-[10px] overflow-hidden h-[calc(100vh-52px)]">
        <div className="w-[260px] shrink-0 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] flex flex-col overflow-hidden">
          <ProjectSidebar projectId={id} />
        </div>
        
        {children}

      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
