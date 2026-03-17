"use server";

import { db } from "@/server/db";
import { jobs, stageEvents, stageEnum } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// 1. Strict Runtime Validation Schema
const createJobSchema = z.object({
  company: z.string().min(1, "Company name is required").max(255),
  title: z.string().min(1, "Job title is required").max(255),
  stage: z.enum(stageEnum.enumValues).default("bookmarked"),
});

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
