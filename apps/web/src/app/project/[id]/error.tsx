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
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", background: "var(--bg-canvas)", color: "var(--text-primary)", padding: "24px"
    }}>
      <AlertCircle size={40} style={{ color: "var(--status-error-text)", marginBottom: "20px" }} />
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>Failed to load project</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "400px", textAlign: "center", fontSize: "0.9rem" }}>
        {error.message || "We couldn't load this project. It might have been deleted or you don't have access."}
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={() => reset()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
