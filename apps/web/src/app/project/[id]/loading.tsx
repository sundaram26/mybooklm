export default function ProjectLoading() {
  return (
    <div className="app-main" style={{ flexDirection: "row" }}>
      {/* Sidebar Skeleton */}
      <div style={{
        width: "var(--sidebar-width)", height: "100%",
        borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)",
        display: "flex", flexDirection: "column", padding: "16px"
      }}>
        <div className="skeleton" style={{ width: "80%", height: "24px", borderRadius: "var(--radius-md)", marginBottom: "24px" }} />
        <div className="skeleton" style={{ width: "40%", height: "14px", borderRadius: "var(--radius-sm)", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "100%", height: "36px", borderRadius: "var(--radius-md)", marginBottom: "8px" }} />
        <div className="skeleton" style={{ width: "100%", height: "36px", borderRadius: "var(--radius-md)", marginBottom: "8px" }} />
      </div>

      {/* Center Panel Skeleton */}
      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
        <div style={{ height: "52px", borderBottom: "1px solid var(--border-subtle)", padding: "0 16px", display: "flex", alignItems: "center" }}>
           <div className="skeleton" style={{ width: "200px", height: "20px", borderRadius: "var(--radius-md)" }} />
        </div>
        <div style={{ flex: 1, padding: "24px" }}>
           <div className="skeleton" style={{ width: "70%", height: "80px", borderRadius: "var(--radius-lg)", marginBottom: "16px", alignSelf: "flex-end" }} />
           <div className="skeleton" style={{ width: "60%", height: "60px", borderRadius: "var(--radius-lg)" }} />
        </div>
      </div>
    </div>
  );
}
