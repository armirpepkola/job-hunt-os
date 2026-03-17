import { z } from "zod";
import { stageEnum } from "@/server/db/schema";

export const createJobSchema = z.object({
  company: z.string().min(1, "Company name is required").max(255),
  title: z.string().min(1, "Job title is required").max(255),
  stage: z.enum(stageEnum.enumValues),
});

export const updateJobStageSchema = z.object({
  jobId: z.string().uuid("Invalid Job ID"),
  stage: z.enum(stageEnum.enumValues),
});
