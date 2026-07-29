import { axiosClient, API_BASE } from "./axios-client";


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

// Session cache to prevent fetching sessions list on every message stream
const sessionCache: Record<string, string> = {};

async function resolveSessionId(notebookId: string): Promise<string> {
  if (sessionCache[notebookId]) {
    return sessionCache[notebookId];
  }

  // 1. Fetch sessions
  const res = await axiosClient.get(`/notebooks/${notebookId}/chats`);
  const sessions = res.data?.data || [];

  if (sessions.length > 0) {
    sessionCache[notebookId] = sessions[0].id;
    return sessions[0].id;
  }

  // 2. Create session if none exists
  const createRes = await axiosClient.post(`/notebooks/${notebookId}/chats`, {
    title: "Default Chat",
  });
  const session = createRes.data?.data;
  sessionCache[notebookId] = session.id;
  return session.id;
}

export const chatApi = {
  async getChatHistory(notebookId: string): Promise<ChatMessage[]> {
    try {
      const sessionId = await resolveSessionId(notebookId);
      const res = await axiosClient.get(`/notebooks/${notebookId}/chats/${sessionId}/messages`);
      const messages = (res.data?.data || []).map((msg: any) => ({
        id: msg.id,
        sessionId: msg.sessionId,
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
        parentId: msg.parentId,
        createdAt: msg.createdAt,
        citations: msg.citations,
      }));
      return messages;
    } catch {
      return [];
    }
  },

  async streamChat(
    notebookId: string,
    query: string,
    options?: {
      parentId?: string;
    },
    onChunk?: (text: string) => void,
    onComplete?: (fullText: string, metadata?: any) => void,
    onError?: (err: Error) => void
  ) {
    try {
      const sessionId = await resolveSessionId(notebookId);
      
      const res = await fetch(`${API_BASE}/api/notebooks/${notebookId}/chats/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query,
          stream: true,
          parentId: options?.parentId,
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
      let buffer = "";
      const metadata: { messageId?: string; userMessageId?: string } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf("\n");
        while (boundary !== -1) {
          const line = buffer.substring(0, boundary).trim();
          buffer = buffer.substring(boundary + 1);
          
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              boundary = buffer.indexOf("\n");
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                fullText += parsed.chunk;
                if (onChunk) onChunk(parsed.chunk);
              }
              if (parsed.messageId) {
                metadata.messageId = parsed.messageId;
              }
              if (parsed.userMessageId) {
                metadata.userMessageId = parsed.userMessageId;
              }
            } catch {
              fullText += dataStr;
              if (onChunk) onChunk(dataStr);
            }
          }
          boundary = buffer.indexOf("\n");
        }
      }

      if (onComplete) onComplete(fullText, metadata);
    } catch (err: any) {
      if (onError) onError(err);
      else console.error("SSE Chat error:", err);
    }
  },
};
export { resolveSessionId };
