import { create } from "zustand";
import { Notebook } from "./api-client";

interface WorkspaceState {
  viewMode: "landing" | "app";
  currentView: "dashboard" | "notebook" | "sources" | "settings";
  selectedNotebook: Notebook | null;
  activeTab: "chat" | "sources";
  
  // Modals
  isCreateModalOpen: boolean;
  isAddSourceOpen: boolean;
  isAuthModalOpen: boolean;
  isKeySettingsOpen: boolean;

  // Actions
  setViewMode: (mode: "landing" | "app") => void;
  setCurrentView: (view: "dashboard" | "notebook" | "sources" | "settings") => void;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  setActiveTab: (tab: "chat" | "sources") => void;
  
  setCreateModalOpen: (open: boolean) => void;
  setAddSourceOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setKeySettingsOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  viewMode: "landing",
  currentView: "dashboard",
  selectedNotebook: null,
  activeTab: "chat",
  
  isCreateModalOpen: false,
  isAddSourceOpen: false,
  isAuthModalOpen: false,
  isKeySettingsOpen: false,

  setViewMode: (viewMode) => {
    set({ viewMode });
    if (typeof window !== "undefined") {
      if (viewMode === "app") {
        localStorage.setItem("noetalm_view_mode", "app");
      } else {
        localStorage.removeItem("noetalm_view_mode");
      }
    }
  },
  setCurrentView: (currentView) => set({ currentView }),
  setSelectedNotebook: (selectedNotebook) => set({ selectedNotebook }),
  setActiveTab: (activeTab) => set({ activeTab }),

  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setAddSourceOpen: (isAddSourceOpen) => set({ isAddSourceOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setKeySettingsOpen: (isKeySettingsOpen) => set({ isKeySettingsOpen }),
}));
