"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJobSchema } from "../schema";
import { useJobs, useCreateJob } from "../queries";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export function JobDashboard() {
  const { data: jobs, isLoading } = useJobs();
  const createJob = useCreateJob();

  // Initialize the form with strict Zod typing
  const form = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      company: "",
      title: "",
      stage: "bookmarked",
    },
  });

  function onSubmit(values: z.infer<typeof createJobSchema>) {
    createJob.mutate(values, {
      onSuccess: () => {
        form.reset(); // Clear the form on success
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 1. The Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Job Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex gap-4 items-start"
            >
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Company (e.g., Google)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Role (e.g., Frontend Engineer)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createJob.isPending}>
                {createJob.isPending ? "Adding..." : "Add Job"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 2. The Data List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Jobs</h2>
        {isLoading ? (
          <p className="text-zinc-500 animate-pulse">Loading board...</p>
        ) : jobs?.length === 0 ? (
          <p className="text-zinc-500">No jobs tracked yet. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs?.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{job.company}</CardTitle>
                  <p className="text-sm text-zinc-500">{job.title}</p>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                    Stage: {job.currentStage}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
