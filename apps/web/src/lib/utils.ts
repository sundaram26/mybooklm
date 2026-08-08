export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred.";
}

export function isAnonymousUser(user: unknown): boolean {
  if (!user || typeof user !== "object") return true;
  return (user as any).isAnonymous === true;
}
