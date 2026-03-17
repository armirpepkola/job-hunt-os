import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJobAction,
  getJobsAction,
  updateJobStageAction,
} from "./actions";

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

export function useUpdateJobStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Parameters<typeof updateJobStageAction>[0]) => {
      const { data, error } = await updateJobStageAction(params);
      if (error) throw new Error(error);
      return data;
    },
    onMutate: async (newStageData) => {
      await queryClient.cancelQueries({ queryKey: jobKeys.lists() });

      const previousJobs = queryClient.getQueryData<any[]>(jobKeys.lists());

      if (previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), (old: any[]) =>
          old.map((job) =>
            job.id === newStageData.jobId
              ? { ...job, currentStage: newStageData.stage }
              : job,
          ),
        );
      }

      return { previousJobs };
    },
    // 2. Rollback on Error
    onError: (err, newStageData, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
