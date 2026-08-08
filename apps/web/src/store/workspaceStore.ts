import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
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

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      guestTurnCount: 0,
      selectedDocumentId: null,
      centerPanelMode: "chat",
      customizingStudioFeature: null,
      
      selectedModelId: null,
      availableModels: [],
      
      isCreateModalOpen: false,
      isAddSourceOpen: false,
      isAuthModalOpen: false,

      incrementGuestTurn: () => set((state) => ({ guestTurnCount: state.guestTurnCount + 1 })),
      setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
      setCenterPanelMode: (centerPanelMode) => set({ centerPanelMode }),
      setCustomizingStudioFeature: (customizingStudioFeature) => set({ customizingStudioFeature }),

      setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
      setAvailableModels: (availableModels) => set({ availableModels }),

      setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
      setAddSourceOpen: (isAddSourceOpen) => set({ isAddSourceOpen }),
      setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
    }),
    {
      name: "noetalm-workspace",
      partialize: (state) => ({ 
        selectedModelId: state.selectedModelId,
        guestTurnCount: state.guestTurnCount
      }),
    }
  )
);
