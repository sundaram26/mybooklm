import axios from "axios";
import { toast } from "sonner";
import { useWorkspaceStore } from "../../store/workspaceStore";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const axiosClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("noetalm_guest_id");
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem("noetalm_guest_id", id);
  }
  return id;
}

// Request interceptor: Auto-attach guest ID
axiosClient.interceptors.request.use((config) => {
  const guestId = getGuestId();
  if (guestId && config.params?.guestId === undefined) {
    config.params = { ...config.params, guestId };
  }
  return config;
});

// Response interceptor: Global error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useWorkspaceStore.getState().setAuthModalOpen(true);
      toast.error("Please sign in to continue.");
    } else if (error.response?.status === 429) {
      toast.warning("Rate limit exceeded. Please slow down.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error, please try again later.");
    }
    return Promise.reject(error);
  }
);
