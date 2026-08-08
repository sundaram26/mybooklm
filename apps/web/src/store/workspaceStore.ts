import { create } from "zustand";
import { Notebook } from "../lib/api";


interface WorkspaceState {
  viewMode: "landing" | "app";
  currentView: "dashboard" | "notebook" | "sources";
  selectedNotebook: Notebook | null;
  activeTab: "chat" | "sources";
  guestTurnCount: number;
  selectedDocumentId: string | null;
  centerPanelMode: "chat" | "add-source" | "studio";
  customizingStudioFeature: string | null;

  // Models
  selectedModelId: string | null;
  availableModels: Array<{ id: string; provider: string; name: string }>;
  
  // Modals
  isCreateModalOpen: boolean;
  isAddSourceOpen: boolean;
  isAuthModalOpen: boolean;

  // Actions
  setViewMode: (mode: "landing" | "app") => void;
  setCurrentView: (view: "dashboard" | "notebook" | "sources") => void;
  setSelectedNotebook: (notebook: Notebook | null) => void;
  setActiveTab: (tab: "chat" | "sources") => void;
  incrementGuestTurn: () => void;
  setSelectedDocumentId: (id: string | null) => void;
  setCenterPanelMode: (mode: "chat" | "add-source" | "studio") => void;
  setCustomizingStudioFeature: (feature: string | null) => void;
  
  setSelectedModelId: (id: string | null) => void;
  setAvailableModels: (models: Array<{ id: string; provider: string; name: string }>) => void;
  
  setCreateModalOpen: (open: boolean) => void;
  setAddSourceOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  viewMode: "landing",
  currentView: "dashboard",
  selectedNotebook: null,
  activeTab: "chat",
  guestTurnCount: 0,
  selectedDocumentId: null,
  centerPanelMode: "chat",
  customizingStudioFeature: null,
  
  selectedModelId: null,
  availableModels: [],
  
  isCreateModalOpen: false,
  isAddSourceOpen: false,
  isAuthModalOpen: false,

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
  setSelectedNotebook: (selectedNotebook) => set({ 
    selectedNotebook, 
    selectedDocumentId: null, 
    centerPanelMode: "chat" 
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  incrementGuestTurn: () => set((state) => ({ guestTurnCount: state.guestTurnCount + 1 })),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setCenterPanelMode: (centerPanelMode) => set({ centerPanelMode }),
  setCustomizingStudioFeature: (customizingStudioFeature) => set({ customizingStudioFeature }),

  setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
  setAvailableModels: (availableModels) => set({ availableModels }),

  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setAddSourceOpen: (isAddSourceOpen) => set({ isAddSourceOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
}));
