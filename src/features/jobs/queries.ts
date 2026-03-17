import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createJobAction,
  getJobsAction,
  updateJobStageAction,
} from "./actions";

type JobBoardData = NonNullable<
  Awaited<ReturnType<typeof getJobsAction>>["data"]
>;

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

      // inject dynamically inferred type here.
      const previousJobs = queryClient.getQueryData<JobBoardData>(
        jobKeys.lists(),
      );

      if (previousJobs) {
        queryClient.setQueryData<JobBoardData>(jobKeys.lists(), (old) =>
          old
            ? old.map((job) =>
                job.id === newStageData.jobId
                  ? { ...job, currentStage: newStageData.stage }
                  : job,
              )
            : [],
        );
      }

      return { previousJobs };
    },
    onError: (err, newStageData, context) => {
      console.error(
        `[Rollback] Failed to update job ${newStageData.jobId}:`,
        err,
      );
      if (context?.previousJobs) {
        queryClient.setQueryData(jobKeys.lists(), context.previousJobs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { uploadDocumentAction } = await import("./actions");
      const { data, error } = await uploadDocumentAction(formData);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
