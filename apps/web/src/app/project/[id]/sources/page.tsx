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
    <div style={{ flex: 1, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "12px" }}>
         <button onClick={() => router.push(`/project/${projectId}`)} className="btn btn-ghost" style={{ padding: "4px" }}>
            <ArrowLeft size={16} />
         </button>
         <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>All Sources</h2>
      </div>
      <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
         <SourceList projectId={projectId} />
      </div>
    </div>
  );
}
