"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
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
    <div className="flex flex-col items-center justify-center h-[100vh] bg-[var(--bg-canvas)] text-[var(--text-primary)] p-6">
      <AlertCircle size={48} className="text-[var(--status-error-text)] mb-6" />
      <h2 className="text-[1.2rem] font-semibold mb-3">Something went wrong!</h2>
      <p className="text-[var(--text-secondary)] mb-6 max-w-[400px] text-center">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
