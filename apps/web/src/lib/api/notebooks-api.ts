import { axiosClient } from "./axios-client";

export interface Notebook {
  id: string;
  title: string;
  description?: string | null;
  userId?: string | null;
  guestId?: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: any[];
  _count?: {
    documents: number;
    messages: number;
  };
}

// Persist a stable guest ID in localStorage
export function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("noetalm_guest_id");
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem("noetalm_guest_id", id);
  }
  return id;
}

export const notebooksApi = {
  async getNotebooks(userId?: string): Promise<Notebook[]> {
    const guestId = !userId ? getGuestId() : undefined;
    const params: Record<string, string> = {};
    if (guestId) params.guestId = guestId;
    const response = await axiosClient.get("/notebooks", { params });
    return response.data?.data || [];
  },

  async createNotebook(data: { title: string; description?: string }, userId?: string): Promise<Notebook> {
    const guestId = !userId ? getGuestId() : undefined;
    const response = await axiosClient.post("/notebooks", { ...data, guestId });
    return response.data?.data;
  },

  async deleteNotebook(id: string): Promise<void> {
    const guestId = getGuestId();
    await axiosClient.delete(`/notebooks/${id}`, { params: { guestId } });
  },
};
