import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "var(--bg-canvas)", color: "var(--text-primary)"
    }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700, marginBottom: "16px", color: "var(--accent-orange)" }}>404</h1>
      <p style={{ fontSize: "1.2rem", fontWeight: 500, marginBottom: "8px" }}>Page not found</p>
      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "32px", textAlign: "center", maxWidth: "400px" }}>
        The project or page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
