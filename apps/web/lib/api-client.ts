const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Notebook {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  documents?: DocumentItem[];
  _count?: {
    documents: number;
    messages: number;
  };
}

export interface DocumentItem {
  id: string;
  notebookId: string;
  title: string;
  type: "PDF" | "TXT" | "MD" | "CSV" | "JSON" | "IMAGE" | "URL";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  fileUrl?: string;
  fileSize?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  parentId?: string | null;
  createdAt: string;
  citations?: Array<{
    documentId: string;
    documentTitle: string;
    snippet: string;
    score: number;
  }>;
}

export const api = {
  // --- Notebooks ---
  async getNotebooks(): Promise<Notebook[]> {
    const res = await fetch(`${API_BASE}/api/notebooks`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch notebooks");
    return res.json();
  },

  async createNotebook(data: { name: string; description?: string }): Promise<Notebook> {
    const res = await fetch(`${API_BASE}/api/notebooks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create notebook");
    return res.json();
  },

  async deleteNotebook(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notebooks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete notebook");
  },

  // --- Documents / Ingestion ---
  async getDocuments(notebookId: string): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  },

  async uploadFile(notebookId: string, file: File): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "FILE");

    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload file");
    return res.json();
  },

  async uploadUrl(notebookId: string, url: string, title?: string): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: "url", url, title }),
    });
    if (!res.ok) throw new Error("Failed to ingest URL");
    return res.json();
  },

  async createTextNote(notebookId: string, text: string, title: string): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: "text", text, title }),
    });
    if (!res.ok) throw new Error("Failed to create text note");
    return res.json();
  },

  async getDocumentStatus(notebookId: string, documentId: string): Promise<{ status: string; errorMessage?: string }> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents/${documentId}/status`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to get document status");
    return res.json();
  },

  async deleteDocument(notebookId: string, documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/documents/${documentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to delete document");
  },

  getDocumentFileProxyUrl(notebookId: string, documentId: string): string {
    return `${API_BASE}/api/notebooks/${notebookId}/documents/${documentId}/file`;
  },

  // --- Grounded SSE Chat ---
  async getChatHistory(notebookId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/chat/history`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch chat history");
    return res.json();
  },

  async streamChat(
    notebookId: string,
    query: string,
    options?: {
      parentId?: string;
      customApiKey?: string;
      modelId?: string;
    },
    onChunk?: (text: string) => void,
    onComplete?: (fullText: string, metadata?: any) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query,
          parentId: options?.parentId,
          customApiKey: options?.customApiKey,
          modelId: options?.modelId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Chat request failed with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream in response");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // Handle SSE formatting data: lines
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                fullText += parsed.text;
                if (onChunk) onChunk(parsed.text);
              }
            } catch {
              fullText += dataStr;
              if (onChunk) onChunk(dataStr);
            }
          }
        }
      }

      if (onComplete) onComplete(fullText);
    } catch (err: any) {
      if (onError) onError(err);
      else console.error("SSE Chat error:", err);
    }
  },
};
