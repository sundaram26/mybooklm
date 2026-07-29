import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Notebook, DocumentItem } from "./api";
import { useSession } from "./auth-client";


// --- Queries ---

export function useNotebooks() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  return useQuery<Notebook[], Error>({
    queryKey: ["notebooks", userId],
    queryFn: () => api.getNotebooks(userId),
    // Wait until auth session resolves so we know whether to use userId or guestId
    enabled: !isPending,
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
  const { data: session } = useSession();
  const userId = session?.user?.id;
  return useMutation<Notebook, Error, { title: string; description?: string }>({
    mutationFn: (data) => api.createNotebook(data, userId),
    onSuccess: () => {
      // invalidate all queries starting with "notebooks" (covers ["notebooks", userId])
      queryClient.invalidateQueries({ queryKey: ["notebooks"], exact: false });
    },
  });
}

export function useDeleteNotebook() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"], exact: false });
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

export function useDocument(documentId?: string | null) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: () => (documentId ? api.getDocument(documentId) : null),
    enabled: !!documentId,
  });
}

export function useGenerateStudio(notebookId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { feature: string; customParams?: Record<string, any> }>({
    mutationFn: ({ feature, customParams }) =>
      api.generateStudioOutput(notebookId, feature, { customParams }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", notebookId] });
    },
  });
}
