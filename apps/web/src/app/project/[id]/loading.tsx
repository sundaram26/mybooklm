export default function ProjectLoading() {
  return (
    <div className="app-main flex-row">
      {/* Sidebar Skeleton */}
      <div className="w-[var(--sidebar-width)] h-full border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col p-4">
        <div className="skeleton w-[80%] h-6 rounded-[var(--radius-md)] mb-6" />
        <div className="skeleton w-[40%] h-[14px] rounded-[var(--radius-sm)] mb-3" />
        <div className="skeleton w-full h-9 rounded-[var(--radius-md)] mb-2" />
        <div className="skeleton w-full h-9 rounded-[var(--radius-md)] mb-2" />
      </div>

      {/* Center Panel Skeleton */}
      <div className="flex-1 h-full flex flex-col bg-[var(--bg-canvas)]">
        <div className="h-[52px] border-b border-[var(--border-subtle)] px-4 flex items-center">
           <div className="skeleton w-[200px] h-5 rounded-[var(--radius-md)]" />
        </div>
        <div className="flex-1 p-6 flex flex-col">
           <div className="skeleton w-[70%] h-[80px] rounded-[var(--radius-lg)] mb-4 self-end" />
           <div className="skeleton w-[60%] h-[60px] rounded-[var(--radius-lg)]" />
        </div>
      </div>
    </div>
  );
}
