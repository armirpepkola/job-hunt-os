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
          userId: userId,
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
      where: eq(jobs.userId, userId),
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

export async function uploadDocumentAction(formData: FormData) {
  try {
    const userId = await requireAuth();
    const jobId = formData.get("jobId") as string;
    const file = formData.get("file") as File;
    const docType = formData.get("type") as
      | "resumePath"
      | "coverLetterPath"
      | "jobDescriptionPath";

    if (!jobId || !file || file.size === 0)
      return { error: "Missing file or job ID", data: null };

    // Verify Ownership
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));
    if (!job) return { error: "Unauthorized", data: null };

    // Upload to Supabase Storage
    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    // Path structure: {userId}/{jobId}/resumePath-1710000000.pdf
    const filePath = `${userId}/${jobId}/${docType}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    // Update the Database Pointer & Timeline
    const updatedJob = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(jobs)
        .set({ [docType]: filePath, updatedAt: new Date() })
        .where(eq(jobs.id, jobId))
        .returning();

      await tx.insert(stageEvents).values({
        jobId: jobId,
        stage: job.currentStage,
        notes: `Attached a new ${docType === "resumePath" ? "Resume" : "Cover Letter"}.`,
      });

      return updated;
    });

    return { data: updatedJob, error: null };
  } catch (error) {
    console.error("Upload failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during upload.";

    return { error: message, data: null };
  }
}

export async function getDocumentUrlAction(path: string) {
  const supabase = await createClient();
  // Generate a signed URL valid for exactly 60 seconds
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60);

  if (error) return { error: error.message, data: null };
  return { data: data.signedUrl, error: null };
}
