"use server";

import { db } from "@/server/db";
import { jobs, stageEvents } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createJobSchema, updateJobStageSchema } from "./schema";

// Temporary dummy user ID until we implement Auth
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

// 2. The Mutation Action
export async function createJobAction(input: z.infer<typeof createJobSchema>) {
  try {
    const parsed = createJobSchema.parse(input);

    const newJob = await db.transaction(async (tx) => {
      const [insertedJob] = await tx
        .insert(jobs)
        .values({
          userId: DUMMY_USER_ID,
          company: parsed.company,
          title: parsed.title,
          currentStage: parsed.stage,
        })
        .returning();

      if (!insertedJob) throw new Error("Failed to insert job");

      await tx.insert(stageEvents).values({
        jobId: insertedJob.id,
        stage: parsed.stage,
        notes: "Initial application tracking created.",
      });

      return insertedJob;
    });

    return { data: newJob, error: null };
  } catch (error) {
    console.error("Failed to create job:", error);
    return { data: null, error: "Failed to create job. Please try again." };
  }
}

// 3. The Query Action
export async function getJobsAction() {
  try {
    const userJobs = await db.query.jobs.findMany({
      where: eq(jobs.userId, DUMMY_USER_ID),
      orderBy: (jobs, { desc }) => [desc(jobs.updatedAt)],
      with: {
        stageEvents: {
          orderBy: (events, { desc }) => [desc(events.createdAt)],
        },
      },
    });

    return { data: userJobs, error: null };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return { data: null, error: "Failed to load your job board." };
  }
}

export async function updateJobStageAction(
  input: z.infer<typeof updateJobStageSchema>,
) {
  try {
    const parsed = updateJobStageSchema.parse(input);

    const updatedJob = await db.transaction(async (tx) => {
      const [job] = await tx
        .update(jobs)
        .set({ currentStage: parsed.stage, updatedAt: new Date() })
        .where(eq(jobs.id, parsed.jobId))
        .returning();

      if (!job) throw new Error("Job not found");

      await tx.insert(stageEvents).values({
        jobId: job.id,
        stage: parsed.stage,
        notes: `Moved to ${parsed.stage}`,
      });

      return job;
    });

    return { data: updatedJob, error: null };
  } catch (error) {
    console.error("Failed to update job stage:", error);
    return { data: null, error: "Failed to update pipeline stage." };
  }
}
