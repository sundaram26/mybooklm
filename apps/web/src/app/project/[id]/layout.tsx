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
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
      background: "var(--bg-canvas)", color: "var(--text-primary)",
    }}>
      <ProjectHeader project={project} />
      <div style={{ display: "flex", flex: 1, padding: "10px", gap: "10px", overflow: "hidden", height: "calc(100vh - 52px)" }}>
        <div style={{ width: "260px", flexShrink: 0, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ProjectSidebar projectId={id} />
        </div>
        
        {children}

      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
