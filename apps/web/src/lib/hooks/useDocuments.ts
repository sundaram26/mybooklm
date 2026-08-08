import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { DocumentItem } from "@repo/shared";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";

export function useDocuments(projectId?: string) {
  return useQuery<DocumentItem[], Error>({
    queryKey: ["documents", projectId],
    queryFn: () => (projectId ? api.getDocuments(projectId) : Promise.resolve([])),
    enabled: !!projectId,
  });
}

export function useDocument(documentId?: string | null) {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: () => (documentId ? api.getDocument(documentId) : null),
    enabled: !!documentId,
  });
}

export function useUploadFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, File>({
    mutationFn: (file) => api.uploadFile(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    }
  });
}

export function useUploadUrl(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { url: string; title?: string }>({
    mutationFn: ({ url, title }) => api.uploadUrl(projectId, url, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    }
  });
}

export function useCreateTextNote(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { text: string; title: string }>({
    mutationFn: ({ text, title }) => api.createTextNote(projectId, text, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    }
  });
}

export function useDeleteDocument(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (documentId) => api.deleteDocument(projectId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    }
  });
}
