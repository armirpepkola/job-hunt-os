"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createJobSchema } from "../schema";
import { useJobs, useCreateJob, useUpdateJobStage } from "../queries";
import { useJobStore } from "../store";
import { JobInspector } from "./job-inspector";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stageEnum } from "@/server/db/schema";

const COLUMNS = stageEnum.enumValues;

export function JobDashboard() {
  const { data: jobs, isLoading } = useJobs();
  const createJob = useCreateJob();
  const updateStage = useUpdateJobStage();
  const openInspector = useJobStore((state) => state.openInspector);

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
      onSuccess: () => form.reset(),
    });
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 flex flex-col h-screen">
      {/* The Creation Form */}
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>Add New Application</CardTitle>
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

      {/* The Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        {isLoading ? (
          <p className="text-zinc-500 animate-pulse">Loading pipeline...</p>
        ) : jobs?.length === 0 ? (
          <p className="text-zinc-500">
            No jobs tracked yet. Add one above to start your board!
          </p>
        ) : (
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((stage) => {
              const columnJobs =
                jobs?.filter((job) => job.currentStage === stage) || [];

              return (
                <div
                  key={stage}
                  className="w-80 flex flex-col bg-zinc-100 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-700">
                      {stage.replace("_", " ")}
                    </h3>
                    <span className="bg-zinc-200 text-zinc-600 text-xs py-1 px-2 rounded-full font-medium">
                      {columnJobs.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 overflow-y-auto">
                    {columnJobs.map((job) => (
                      <Card
                        key={job.id}
                        onClick={() => openInspector(job.id)}
                        className="cursor-pointer hover:shadow-md transition-shadow hover:border-zinc-400"
                      >
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">
                            {job.company}
                          </CardTitle>
                          <p className="text-sm text-zinc-500">{job.title}</p>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div onClick={(e) => e.stopPropagation()}>
                            {/* The Stage Mutation Trigger */}
                            <Select
                              value={job.currentStage}
                              onValueChange={(newStage) => {
                                // Type cast is safe here because the Select items are generated from the exact enum
                                updateStage.mutate({
                                  jobId: job.id,
                                  stage:
                                    newStage as (typeof stageEnum.enumValues)[number],
                                });
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs mt-2 w-full">
                                <SelectValue placeholder="Move to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {COLUMNS.map((col) => (
                                  <SelectItem
                                    key={col}
                                    value={col}
                                    className="text-xs"
                                  >
                                    {col.replace("_", " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <JobInspector />
    </div>
  );
}
