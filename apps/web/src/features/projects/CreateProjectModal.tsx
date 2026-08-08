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

  const inputClasses = "w-full px-[10px] py-[7px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] text-[0.8125rem] outline-none transition-colors focus:border-[var(--accent-orange)]";

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.65)] backdrop-blur-[3px] flex items-center justify-center animate-[fadeIn_120ms_ease-out]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] animate-[slideUp_150ms_ease-out] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[14px_18px] border-b border-[var(--border-subtle)]">
          <h3 className="text-[0.875rem] font-semibold text-[var(--text-primary)] font-[family-name:var(--font-heading)]">
            New Project
          </h3>
          <button onClick={handleClose} className="flex p-[2px] bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-[18px]">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[0.72rem] font-medium text-[var(--text-secondary)] mb-[5px]">
                Name <span className="text-[var(--status-error-text)]">*</span>
              </label>
              <input
                type="text" required autoFocus
                placeholder="e.g. Gut Health Research"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-[0.72rem] font-medium text-[var(--text-secondary)] mb-[5px]">
                Description <span className="text-[var(--text-subtle)] font-normal">(optional)</span>
              </label>
              <textarea
                rows={2} placeholder="Brief context or purpose..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className={`${inputClasses} resize-none leading-[1.5]`}
              />
            </div>

            {error && (
              <p className="text-[0.76rem] text-[var(--status-error-text)] px-[10px] py-[7px] bg-[var(--status-error-bg)] rounded-[var(--radius-md)]">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-[18px] pt-[14px] border-t border-[var(--border-subtle)]">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className={`btn btn-primary ${(loading || !title.trim()) ? 'opacity-60' : 'opacity-100'}`}
            >
              {loading ? (
                <span className="w-[13px] h-[13px] rounded-full border-2 border-[rgba(255,255,255,0.3)] border-t-[#fff] animate-[spin_0.7s_linear_infinite] inline-block" />
              ) : null}
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
