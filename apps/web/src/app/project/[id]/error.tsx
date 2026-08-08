"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6">
      <AlertCircle size={40} className="text-[var(--status-error-text)] mb-5" />
      <h2 className="text-[1.1rem] font-semibold mb-3">Failed to load project</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-[400px] text-center text-[0.9rem]">
        {error.message || "We couldn't load this project. It might have been deleted or you don't have access."}
      </p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary no-underline">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
