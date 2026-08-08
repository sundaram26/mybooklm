import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Project } from "@repo/shared";
import { toast } from "sonner";
import { getErrorMessage } from "../utils";

export function useProjects() {
  return useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });
}

export function useProject(id?: string) {
  return useQuery<Project | null, Error>({
    queryKey: ["project", id],
    queryFn: () => (id ? api.getProject(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { title: string; description?: string }>({
    mutationFn: (data) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { previousProjects?: Project[] }>({
    mutationFn: (id) => api.deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"]);
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(["projects"], previousProjects.filter((p) => p.id !== id));
      }
      return { previousProjects };
    },
    onError: (err, id, context) => {
      toast.error(getErrorMessage(err));
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
