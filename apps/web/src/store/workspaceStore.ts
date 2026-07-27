import { create } from "zustand";
import { Notebook } from "../lib/api";

export interface TierConfig {
  provider: "google" | "openai" | "anthropic" | "other" | "default";
  apiKey: string;
  modelId: string;
  baseUrl: string;
}

export interface LLMConfig {
  mini: TierConfig;
  medium: TierConfig;
  high: TierConfig;
}

const DEFAULT_LLM_SETTINGS: LLMConfig = {
  mini: {
    provider: "default",
    apiKey: "",
    modelId: "gemini-2.0-flash",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  medium: {
    provider: "default",
    apiKey: "",
    modelId: "gemini-2.0-flash",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  high: {
    provider: "default",
    apiKey: "",
    modelId: "gemini-2.0-flash",
    baseUrl: "https://openrouter.ai/api/v1",
  },
};

interface WorkspaceState {
  viewMode: "landing" | "app";
  currentView: "dashboard" | "notebook" | "sources" | "settings";
  selectedNotebook: Notebook | null;
  activeTab: "chat" | "sources";
  llmSettings: LLMConfig;
  guestTurnCount: number;
  selectedDocumentId: string | null;
  centerPanelMode: "chat" | "add-source";
  
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
  setLLMTierSetting: (tier: "mini" | "medium" | "high", key: keyof TierConfig, value: string) => void;
  setLLMSettings: (settings: LLMConfig) => void;
  incrementGuestTurn: () => void;
  setSelectedDocumentId: (id: string | null) => void;
  setCenterPanelMode: (mode: "chat" | "add-source") => void;
  
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
  llmSettings: typeof window !== "undefined"
    ? (() => {
        try {
          const stored = localStorage.getItem("noetalm_llm_settings");
          return stored ? { ...DEFAULT_LLM_SETTINGS, ...JSON.parse(stored) } : DEFAULT_LLM_SETTINGS;
        } catch {
          return DEFAULT_LLM_SETTINGS;
        }
      })()
    : DEFAULT_LLM_SETTINGS,
  guestTurnCount: 0,
  selectedDocumentId: null,
  centerPanelMode: "chat",
  
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
  setSelectedNotebook: (selectedNotebook) => set({ 
    selectedNotebook, 
    selectedDocumentId: null, 
    centerPanelMode: "chat" 
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLLMTierSetting: (tier, key, value) => set((state) => {
    const updatedTier = { ...state.llmSettings[tier], [key]: value };
    const updated = { ...state.llmSettings, [tier]: updatedTier };
    if (typeof window !== "undefined") {
      localStorage.setItem("noetalm_llm_settings", JSON.stringify(updated));
    }
    return { llmSettings: updated };
  }),
  setLLMSettings: (settings) => set(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noetalm_llm_settings", JSON.stringify(settings));
    }
    return { llmSettings: settings };
  }),
  incrementGuestTurn: () => set((state) => ({ guestTurnCount: state.guestTurnCount + 1 })),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setCenterPanelMode: (centerPanelMode) => set({ centerPanelMode }),

  setCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setAddSourceOpen: (isAddSourceOpen) => set({ isAddSourceOpen }),
  setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
  setKeySettingsOpen: (isKeySettingsOpen) => set({ isKeySettingsOpen }),
}));
