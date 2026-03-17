import { create } from "zustand";

interface JobUIStore {
  selectedJobId: string | null;
  openInspector: (jobId: string) => void;
  closeInspector: () => void;
}

export const useJobStore = create<JobUIStore>((set) => ({
  selectedJobId: null,
  openInspector: (jobId) => set({ selectedJobId: jobId }),
  closeInspector: () => set({ selectedJobId: null }),
}));
