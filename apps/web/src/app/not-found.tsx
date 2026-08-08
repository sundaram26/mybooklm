import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <h1 className="text-[4rem] font-bold mb-4 text-[var(--accent-orange)]">404</h1>
      <p className="text-[1.2rem] font-medium mb-2">Page not found</p>
      <p className="text-[0.9rem] text-[var(--text-secondary)] mb-8 text-center max-w-[400px]">
        The project or page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary no-underline">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  );
}
