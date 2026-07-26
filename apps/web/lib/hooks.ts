import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Notebook, DocumentItem } from "./api-client";

// --- Queries ---

export function useNotebooks() {
  return useQuery<Notebook[], Error>({
    queryKey: ["notebooks"],
    queryFn: () => api.getNotebooks(),
  });
}

export function useDocuments(notebookId?: string) {
  return useQuery<DocumentItem[], Error>({
    queryKey: ["documents", notebookId],
    queryFn: () => (notebookId ? api.getDocuments(notebookId) : Promise.resolve([])),
    enabled: !!notebookId,
  });
}

export function useChatHistory(notebookId?: string) {
  return useQuery({
    queryKey: ["chatHistory", notebookId],
    queryFn: () => (notebookId ? api.getChatHistory(notebookId) : Promise.resolve([])),
    enabled: !!notebookId,
  });
}

// --- Mutations ---

export function useCreateNotebook() {
  const queryClient = useQueryClient();
  return useMutation<Notebook, Error, { name: string; description?: string }>({
    mutationFn: (data) => api.createNotebook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useUploadFile(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, File>({
    mutationFn: (file) => api.uploadFile(notebookId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", notebookId] });
    },
  });
}

export function useUploadUrl(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { url: string; title?: string }>({
    mutationFn: ({ url, title }) => api.uploadUrl(notebookId, url, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", notebookId] });
    },
  });
}

export function useCreateTextNote(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { text: string; title: string }>({
    mutationFn: ({ text, title }) => api.createTextNote(notebookId, text, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", notebookId] });
    },
  });
}

export function useDeleteDocument(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (documentId) => api.deleteDocument(notebookId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", notebookId] });
    },
  });
}
