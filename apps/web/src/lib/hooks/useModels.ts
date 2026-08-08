import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export function useModels() {
  return useQuery<{ id: string; provider: string; name: string }[], Error>({
    queryKey: ["models"],
    queryFn: () => api.getModels(),
  });
}
