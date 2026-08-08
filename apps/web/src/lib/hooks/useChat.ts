import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export function useChatHistory(projectId?: string) {
  return useQuery({
    queryKey: ["chatHistory", projectId],
    queryFn: () => (projectId ? api.getChatHistory(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}
