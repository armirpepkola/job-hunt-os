import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createJobAction, getJobsAction } from "./actions";

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
};

export function useJobs() {
  return useQuery({
    queryKey: jobKeys.lists(),
    queryFn: async () => {
      const { data, error } = await getJobsAction();
      if (error) throw new Error(error);
      return data;
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Parameters<typeof createJobAction>[0]) => {
      const { data, error } = await createJobAction(params);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
