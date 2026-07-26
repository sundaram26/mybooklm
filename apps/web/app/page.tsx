"use client";

import React, { useState, useEffect } from "react";
import { LandingPage } from "../components/landing/LandingPage";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { RightInfoPanel } from "../components/layout/RightInfoPanel";
import { NotebookGrid } from "../components/notebooks/NotebookGrid";
import { CreateNotebookModal } from "../components/notebooks/CreateNotebookModal";
import { AddSourceModal } from "../components/sources/AddSourceModal";
import { SourceList } from "../components/sources/SourceList";
import { ChatInterface } from "../components/chat/ChatInterface";
import { AuthModal } from "../components/auth/AuthModal";
import { KeySettingsModal } from "../components/settings/KeySettingsModal";
import { useSession, signOut } from "../lib/auth-client";
import { api, Notebook, DocumentItem } from "../lib/api-client";
import { MessageSquare, FileText, ArrowLeft } from "lucide-react";
import { useWorkspaceStore } from "../lib/store";
import { useNotebooks, useDocuments, useCreateNotebook, useDeleteNotebook, useDeleteDocument } from "../lib/hooks";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user;

  // Zustand Store Selectors
  const {
    viewMode,
    currentView,
    selectedNotebook,
    activeTab,
    isCreateModalOpen,
    isAddSourceOpen,
    isAuthModalOpen,
    isKeySettingsOpen,
    setViewMode,
    setCurrentView,
    setSelectedNotebook,
    setActiveTab,
    setCreateModalOpen,
    setAddSourceOpen,
    setAuthModalOpen,
    setKeySettingsOpen,
  } = useWorkspaceStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customModelId, setCustomModelId] = useState("gemini-2.0-flash");
  const [guestTurnCount, setGuestTurnCount] = useState(0);

  // Queries
  const { data: notebooks = [] } = useNotebooks();
  const { data: documents = [], refetch: refetchDocuments } = useDocuments(selectedNotebook?.id);

  // Mutations
  const createNotebookMutation = useCreateNotebook();
  const deleteNotebookMutation = useDeleteNotebook();
  const deleteDocumentMutation = useDeleteDocument(selectedNotebook?.id || "");

  useEffect(() => {
    setIsLoaded(true);
    const savedMode = localStorage.getItem("noetalm_view_mode");
    if (session?.user || savedMode === "app") {
      setViewMode("app");
    }
  }, [session, setViewMode]);

  const handleSelectNotebook = (notebook: Notebook) => {
    setSelectedNotebook(notebook);
    setCurrentView("notebook");
    setActiveTab("chat");
  };

  const handleCreateNotebook = async (name: string, description?: string) => {
    const created = await createNotebookMutation.mutateAsync({ name, description });
    handleSelectNotebook(created);
  };

  const handleDeleteNotebook = async (id: string) => {
    await deleteNotebookMutation.mutateAsync(id);
    if (selectedNotebook?.id === id) {
      setSelectedNotebook(null);
      setCurrentView("dashboard");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedNotebook) return;
    await deleteDocumentMutation.mutateAsync(docId);
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  // If in Landing Page mode, render LandingPage matching Image 1
  if (viewMode === "landing") {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setAuthModalOpen(true)}
          onExploreFree={() => {
            setViewMode("app");
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setViewMode("app");
          }}
        />
      </>
    );
  }

  // Otherwise, render full Dashboard Workspace matching Image 2
  return (
    <div className="app-container">
      {/* Left Navigation Sidebar matching Image 2 */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          if (v === "dashboard") setSelectedNotebook(null);
        }}
        onGoToLanding={() => setViewMode("landing")}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={() => signOut()}
        guestTurnCount={guestTurnCount}
      />

      {/* Center Main Workspace Content Area */}
      <main className="app-main">
        <Header
          activeNotebookTitle={selectedNotebook?.name}
          onNavigateHome={() => {
            setSelectedNotebook(null);
            setCurrentView("dashboard");
          }}
          onOpenCreateNotebook={() => setCreateModalOpen(true)}
          onOpenAddSource={() => setAddSourceOpen(true)}
          onOpenKeySettings={() => setKeySettingsOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Views */}
        {currentView === "dashboard" && (
          <NotebookGrid
            notebooks={notebooks}
            onSelectNotebook={handleSelectNotebook}
            onDeleteNotebook={handleDeleteNotebook}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            searchQuery={searchQuery}
          />
        )}

        {currentView === "notebook" && selectedNotebook && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>
            {/* Workspace Header Tabs */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => {
                    setSelectedNotebook(null);
                    setCurrentView("dashboard");
                  }}
                  className="btn btn-ghost"
                  style={{ padding: "6px" }}
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {selectedNotebook.name}
                </h2>
              </div>

              {/* Chat / Sources Tab Switch */}
              <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--bg-canvas-subtle)", padding: "4px", borderRadius: "var(--radius-md)" }}>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`btn ${activeTab === "chat" ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  <MessageSquare size={15} />
                  <span>Grounded Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`btn ${activeTab === "sources" ? "btn-primary" : "btn-ghost"}`}
                  style={{ padding: "6px 14px", fontSize: "0.85rem" }}
                >
                  <FileText size={15} />
                  <span>Sources ({documents.length})</span>
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              {activeTab === "chat" ? (
                <ChatInterface
                  notebookId={selectedNotebook.id}
                  customApiKey={customApiKey}
                  customModelId={customModelId}
                  isGuest={!user || (user as any).isAnonymous}
                  onIncrementGuestTurn={() => setGuestTurnCount((c) => c + 1)}
                />
              ) : (
                <div style={{ padding: "24px", height: "100%", overflowY: "auto" }}>
                  <SourceList
                    notebookId={selectedNotebook.id}
                    documents={documents}
                    onRefresh={refetchDocuments}
                    onDeleteDocument={handleDeleteDocument}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === "sources" && (
          <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>
              All Ingested Sources Across Projects
            </h2>
            {selectedNotebook ? (
              <SourceList
                notebookId={selectedNotebook.id}
                documents={documents}
                onRefresh={refetchDocuments}
                onDeleteDocument={handleDeleteDocument}
              />
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Select a notebook from the sidebar or home to view sources.</p>
            )}
          </div>
        )}

        {currentView === "settings" && (
          <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>
              Custom LLM API Keys & Model Routing
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px" }}>
              Configure your personal Gemini, OpenAI, or Anthropic API key to bypass server keys and route prompts directly.
            </p>
            <button onClick={() => setKeySettingsOpen(true)} className="btn btn-primary">
              Configure Model Keys
            </button>
          </div>
        )}
      </main>

      {/* Right Info / Analytics Panel matching Image 2 */}
      <RightInfoPanel
        selectedNotebook={selectedNotebook}
        documents={documents}
      />

      {/* Modals */}
      <CreateNotebookModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateNotebook}
      />

      {selectedNotebook && (
        <AddSourceModal
          isOpen={isAddSourceOpen}
          onClose={() => setAddSourceOpen(false)}
          notebookId={selectedNotebook.id}
          onSourceAdded={refetchDocuments}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setViewMode("app");
        }}
      />

      <KeySettingsModal
        isOpen={isKeySettingsOpen}
        onClose={() => setKeySettingsOpen(false)}
        customApiKey={customApiKey}
        customModelId={customModelId}
        onSaveKeys={(key, model) => {
          setCustomApiKey(key);
          setCustomModelId(model);
        }}
      />
    </div>
  );
}
