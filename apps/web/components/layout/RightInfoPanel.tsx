"use client";

import React from "react";
import { HardDrive, FileText, Image as ImageIcon, Pin, Activity, Info, Tag } from "lucide-react";
import { Notebook, DocumentItem } from "../../lib/api-client";

interface RightInfoPanelProps {
  selectedNotebook?: Notebook | null;
  selectedDocument?: DocumentItem | null;
  documents?: DocumentItem[];
}

export function RightInfoPanel({
  selectedNotebook,
  selectedDocument,
  documents = [],
}: RightInfoPanelProps) {
  // Compute size stats
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const maxStorageBytes = 1073741824; // 1 GB
  const storagePercentage = Math.min(100, (totalSizeBytes / maxStorageBytes) * 100);
  
  const docCount = documents.filter(d => d.type !== "IMAGE").length;
  const imgCount = documents.filter(d => d.type === "IMAGE").length;

  return (
    <aside className="app-info-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[1.05rem] font-bold text-text-primary">Info</h3>
        <Info size={18} className="text-text-muted" />
      </div>

      {/* Storage Meters matching Image 2 */}
      <div className="flex flex-col gap-4 mb-7">
        {/* Documents Card */}
        <div className="bg-canvas-subtle border border-border-subtle rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[0.78rem] font-semibold text-text-muted">Documents</span>
            <FileText size={15} className="text-text-muted" />
          </div>
          <div className="text-[1.3rem] font-[800] text-text-primary mb-2">
            {docCount} files <span className="text-[0.85rem] font-medium text-text-muted">({totalSizeMB} MB / 1 GB)</span>
          </div>
          <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
            <div className="h-full bg-accent-blue" style={{ width: `${storagePercentage}%` }} />
          </div>
        </div>

        {/* Images Card */}
        <div className="bg-canvas-subtle border border-border-subtle rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[0.78rem] font-semibold text-text-muted">Images & Media</span>
            <ImageIcon size={15} className="text-text-muted" />
          </div>
          <div className="text-[1.3rem] font-[800] text-text-primary mb-2">
            {imgCount} assets
          </div>
          <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
            <div className="h-full bg-[var(--status-warning-text)]" style={{ width: `${Math.min(100, (imgCount / 5) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex flex-col gap-4 mb-7">
        <h4 className="text-[0.85rem] font-bold text-text-primary">Properties</h4>
        
        <div className="flex justify-between text-[0.82rem]">
          <span className="text-text-muted">Notebook:</span>
          <span className="font-semibold text-text-primary">{selectedNotebook?.name || "All Projects"}</span>
        </div>

        <div className="flex justify-between text-[0.82rem]">
          <span className="text-text-muted">Total Sources:</span>
          <span className="font-semibold text-text-primary">{documents.length}</span>
        </div>

        <div className="flex justify-between text-[0.82rem]">
          <span className="text-text-muted">Created:</span>
          <span className="font-semibold text-text-primary">
            {selectedNotebook?.createdAt ? new Date(selectedNotebook.createdAt).toLocaleDateString() : "Today"}
          </span>
        </div>
      </div>

      {/* Tags Section matching Image 2 */}
      <div className="flex flex-col gap-3 mb-7">
        <div className="flex items-center gap-1.5">
          <Tag size={14} className="text-text-muted" />
          <h4 className="text-[0.85rem] font-bold text-text-primary">Tags</h4>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent-blue-light)] text-accent-blue text-[0.75rem] font-semibold">
            • Research
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--status-success-bg)] text-[var(--status-success-text)] text-[0.75rem] font-semibold">
            • Grounded RAG
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] text-[0.75rem] font-semibold">
            • AI Synthesis
          </span>
        </div>
      </div>

      {/* Pinned Items & Activity */}
      <div className="flex flex-col gap-3.5 mt-auto">
        <div className="flex items-center gap-2 text-[0.85rem] text-text-muted cursor-pointer">
          <Pin size={15} />
          <span>Pinned items</span>
        </div>
        <div className="flex items-center gap-2 text-[0.85rem] text-text-muted cursor-pointer">
          <Activity size={15} />
          <span>Recent Activity</span>
        </div>
      </div>
    </aside>
  );
}
