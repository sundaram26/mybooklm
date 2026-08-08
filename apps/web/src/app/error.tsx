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
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg-canvas)", color: "var(--text-primary)", padding: "24px"
    }}>
      <AlertCircle size={48} style={{ color: "var(--status-error-text)", marginBottom: "24px" }} />
      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "12px" }}>Something went wrong!</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "400px", textAlign: "center" }}>
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
