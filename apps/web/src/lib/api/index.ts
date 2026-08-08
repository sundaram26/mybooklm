import { projectsApi } from "./projects-api";
import { documentsApi } from "./documents-api";
import { chatApi, ChatMessage } from "./chat-api";
import { Project, DocumentItem } from "@repo/shared";

export type { Project, DocumentItem, ChatMessage };

export const api = {
  ...projectsApi,
  ...documentsApi,
  ...chatApi,
  getModels: async () => {
    const res = await import("./axios-client").then(m => m.axiosClient.get("/models"));
    return res.data?.data || [];
  }
};
