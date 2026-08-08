import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { DocumentItem } from "@repo/shared";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";

export function useGenerateStudio(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation<DocumentItem, Error, { feature: string; customParams?: Record<string, any>; selectedModelId?: string | null }>({
    mutationFn: ({ feature, customParams, selectedModelId }) =>
      api.generateStudioOutput(projectId, feature, { customParams, selectedModelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    }
  });
}
