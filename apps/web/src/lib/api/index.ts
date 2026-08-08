import { notebooksApi, Notebook } from "./notebooks-api";
import { documentsApi, DocumentItem } from "./documents-api";
import { chatApi, ChatMessage } from "./chat-api";

export type { Notebook, DocumentItem, ChatMessage };

export const api = {
  ...notebooksApi,
  ...documentsApi,
  ...chatApi,
  getModels: async () => {
    const res = await import("./axios-client").then(m => m.axiosClient.get("/models"));
    return res.data?.data || [];
  }
};
