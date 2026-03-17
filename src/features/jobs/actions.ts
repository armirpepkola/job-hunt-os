"use server";

import { db } from "@/server/db";
import { jobs, stageEvents } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { createJobSchema, updateJobStageSchema } from "./schema";
import { createClient } from "@/lib/supabase/server";

// The Identity Verifier
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return user.id;
}

// Create Job Mutation
export async function createJobAction(input: z.infer<typeof createJobSchema>) {
  try {
    const userId = await requireAuth();
    const parsed = createJobSchema.parse(input);

    const newJob = await db.transaction(async (tx) => {
      const [insertedJob] = await tx
        .insert(jobs)
        .values({
          userId: userId, // Tied strictly to the authenticated user
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

// Get Jobs Query
export async function getJobsAction() {
  try {
    const userId = await requireAuth();

    const userJobs = await db.query.jobs.findMany({
      where: eq(jobs.userId, userId), // Enforce Row-Level Tenant Isolation
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

// Update Job Stage Mutation
export async function updateJobStageAction(
  input: z.infer<typeof updateJobStageSchema>,
) {
  try {
    const userId = await requireAuth();
    const parsed = updateJobStageSchema.parse(input);

    const updatedJob = await db.transaction(async (tx) => {
      const [job] = await tx
        .update(jobs)
        .set({ currentStage: parsed.stage, updatedAt: new Date() })
        .where(and(eq(jobs.id, parsed.jobId), eq(jobs.userId, userId)))
        .returning();

      if (!job) throw new Error("Job not found or unauthorized");

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
