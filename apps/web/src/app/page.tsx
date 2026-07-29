"use client";

import React, { useState, useEffect } from "react";
import { LandingPage } from "../features/landing/LandingPage";
import { NotebookGrid } from "../features/notebooks/NotebookGrid";
import { CreateNotebookModal } from "../features/notebooks/CreateNotebookModal";
import { AddSourceModal } from "../features/sources/AddSourceModal";
import { SourceList } from "../features/sources/SourceList";
import { ChatInterface } from "../features/chat/ChatInterface";
import { AddSourceGrid } from "../features/sources/AddSourceGrid";
import { SourceViewer } from "../features/sources/SourceViewer";
import { NotebookHeader } from "../features/notebooks/NotebookHeader";
import { NotebookSidebar } from "../features/notebooks/NotebookSidebar";
import { StudioPanel } from "../features/notebooks/StudioPanel";
import { AuthModal } from "../features/auth/AuthModal";
import { StudioContentViewer } from "../features/notebooks/StudioContentViewer";
import { CustomizeStudioModal } from "../features/notebooks/CustomizeStudioModal";
import { useSession } from "../lib/auth-client";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useDocuments } from "../lib/hooks";
import { AppTopBar } from "../components/layout/AppTopBar";
import { AppBottomBar } from "../components/layout/AppBottomBar";


export default function Home() {
  const { data: session } = useSession();

  const {
    viewMode, currentView, selectedNotebook, activeTab,
    isCreateModalOpen, isAddSourceOpen, isAuthModalOpen,
    setViewMode, setCurrentView, setSelectedNotebook, setActiveTab,
    setCreateModalOpen, setAddSourceOpen, setAuthModalOpen,
    selectedDocumentId, centerPanelMode, setCenterPanelMode,
    customizingStudioFeature, setCustomizingStudioFeature,
  } = useWorkspaceStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [] } = useDocuments(selectedNotebook?.id);

  useEffect(() => {
    setIsLoaded(true);
    const savedMode = localStorage.getItem("noetalm_view_mode");
    if (session?.user || savedMode === "app") setViewMode("app");
  }, [session, setViewMode]);

  if (!isLoaded) return null;

  if (viewMode === "landing") {
    return (
      <>
        <LandingPage />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => setViewMode("app")} />
      </>
    );
  }

  // ── Active notebook: full-screen 3-column layout ─────────────────────────
  if (currentView === "notebook" && selectedNotebook) {
    return (
      <>
        <div style={{
          position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
          background: "var(--bg-canvas)", color: "var(--text-primary)",
        }}>
          <NotebookHeader notebook={selectedNotebook} />
          <div style={{ display: "flex", flex: 1, padding: "10px", gap: "10px", overflow: "hidden", height: "calc(100vh - 52px)" }}>
            <div style={{ width: "260px", flexShrink: 0, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <NotebookSidebar />
            </div>
            
            {(() => {
              const selectedDoc = documents.find(d => d.id === selectedDocumentId);
              const activeStudioDoc = selectedDoc?.studioFeature ? selectedDoc : null;
              const hasStudioFeature = !!activeStudioDoc;

              return (
                <>
                  <div style={{ flex: 1, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Top tab switcher */}
                    <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-canvas-subtle)", padding: "6px 12px", gap: "8px", alignItems: "center" }}>
                      <button 
                        onClick={() => setCenterPanelMode("chat")}
                        style={{
                          padding: "6px 12px", fontSize: "0.78rem",
                          fontWeight: centerPanelMode === "chat" ? 600 : 500,
                          color: centerPanelMode === "chat" ? "var(--text-primary)" : "var(--text-muted)",
                          background: centerPanelMode === "chat" ? "var(--bg-surface)" : "transparent",
                          border: "1px solid " + (centerPanelMode === "chat" ? "var(--border-subtle)" : "transparent"),
                          borderRadius: "var(--radius-md)", cursor: "pointer"
                        }}
                      >
                        Chat
                      </button>
                      {hasStudioFeature && (
                        <button 
                          onClick={() => setCenterPanelMode("studio")}
                          style={{
                            padding: "6px 12px", fontSize: "0.78rem",
                            fontWeight: centerPanelMode === "studio" ? 600 : 500,
                            color: centerPanelMode === "studio" ? "var(--text-primary)" : "var(--text-muted)",
                            background: centerPanelMode === "studio" ? "var(--bg-surface)" : "transparent",
                            border: "1px solid " + (centerPanelMode === "studio" ? "var(--border-subtle)" : "transparent"),
                            borderRadius: "var(--radius-md)", cursor: "pointer"
                          }}
                        >
                          {activeStudioDoc.title}
                        </button>
                      )}
                      {centerPanelMode === "add-source" && (
                        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          Add Source
                        </span>
                      )}
                    </div>

                    {centerPanelMode === "add-source" ? (
                      <AddSourceGrid />
                    ) : centerPanelMode === "studio" && activeStudioDoc ? (
                      <StudioContentViewer doc={activeStudioDoc} />
                    ) : (
                      <ChatInterface notebookId={selectedNotebook.id} />
                    )}
                  </div>

                  <div style={{ width: "260px", flexShrink: 0, background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {(selectedDocumentId && !hasStudioFeature) ? <SourceViewer /> : <StudioPanel />}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => setViewMode("app")} />
        <CustomizeStudioModal
          isOpen={customizingStudioFeature !== null}
          feature={customizingStudioFeature}
          onClose={() => setCustomizingStudioFeature(null)}
        />
      </>
    );
  }

  // ── Dashboard layout: top bar + main area + bottom tab bar ───────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", width: "100vw",
      background: "var(--bg-canvas)", overflow: "hidden",
    }}>
      {/* Top bar */}
      <AppTopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {currentView === "dashboard" && <NotebookGrid searchQuery={searchQuery} />}

        {currentView === "sources" && (
          <div style={{ padding: "24px 32px", maxWidth: "960px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
              All Sources
            </h2>
            {selectedNotebook ? (
              <SourceList />
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                Select a notebook first to view its sources.
              </p>
            )}
          </div>
        )}

      </main>

      {/* Bottom tab bar */}
      <AppBottomBar />

      {/* Modals */}
      <CreateNotebookModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
      <AddSourceModal isOpen={isAddSourceOpen} onClose={() => setAddSourceOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => setViewMode("app")} />
      <CustomizeStudioModal
        isOpen={customizingStudioFeature !== null}
        feature={customizingStudioFeature}
        onClose={() => setCustomizingStudioFeature(null)}
      />
    </div>
  );
}
