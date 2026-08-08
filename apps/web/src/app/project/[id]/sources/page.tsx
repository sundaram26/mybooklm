"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { SourceList } from "../../../../features/sources/SourceList";
import { ArrowLeft } from "lucide-react";

export default function SourcesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  return (
    <div className="flex-1 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
         <button onClick={() => router.push(`/project/${projectId}`)} className="btn btn-ghost p-1">
            <ArrowLeft size={16} />
         </button>
         <h2 className="text-[1rem] font-semibold">All Sources</h2>
      </div>
      <div className="p-6 overflow-y-auto flex-1">
         <SourceList projectId={projectId} />
      </div>
    </div>
  );
}
