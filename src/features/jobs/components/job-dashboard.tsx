"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMounted } from "@/hooks/use-mounted";

import { createJobSchema } from "../schema";
import { useJobs, useCreateJob, useUpdateJobStage } from "../queries";
import { useJobStore } from "../store";
import { JobInspector } from "./job-inspector";
import { stageEnum } from "@/server/db/schema";

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

const COLUMNS = stageEnum.enumValues;

export function JobDashboard() {
  const isMounted = useMounted();
  const { data: jobs, isLoading } = useJobs();
  const createJob = useCreateJob();
  const updateStage = useUpdateJobStage();
  const openInspector = useJobStore((state) => state.openInspector);

  const form = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { company: "", title: "", stage: "bookmarked" },
  });

  function onSubmit(values: z.infer<typeof createJobSchema>) {
    createJob.mutate(values, { onSuccess: () => form.reset() });
  }

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (destination.droppableId !== source.droppableId) {
      updateStage.mutate({
        jobId: draggableId,
        stage: destination.droppableId as (typeof stageEnum.enumValues)[number],
      });
    }
  }

  if (!isMounted || isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8 flex flex-col h-[calc(100vh-4rem)]">
        <p className="text-zinc-500 animate-pulse">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 flex flex-col h-[calc(100vh-4rem)]">
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

      {/* The Drag & Drop Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        {jobs?.length === 0 ? (
          <p className="text-zinc-500">
            No jobs tracked yet. Add one above to start your board!
          </p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max">
              {COLUMNS.map((stage) => {
                const columnJobs =
                  jobs?.filter((job) => job.currentStage === stage) || [];

                return (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`w-80 flex flex-col rounded-xl p-4 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-zinc-200"
                            : "bg-zinc-100"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-700">
                            {stage.replace("_", " ")}
                          </h3>
                          <span className="bg-zinc-300 text-zinc-700 text-xs py-1 px-2 rounded-full font-medium">
                            {columnJobs.length}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                          {columnJobs.map((job, index) => (
                            <Draggable
                              key={job.id}
                              draggableId={job.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging
                                      ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                      : provided.draggableProps.style
                                          ?.transform,
                                  }}
                                >
                                  <Card
                                    onClick={() => openInspector(job.id)}
                                    className={`cursor-grab active:cursor-grabbing hover:border-zinc-400 transition-shadow ${
                                      snapshot.isDragging
                                        ? "shadow-xl border-blue-400"
                                        : "hover:shadow-md"
                                    }`}
                                  >
                                    <CardHeader className="p-4 pb-2">
                                      <CardTitle className="text-base">
                                        {job.company}
                                      </CardTitle>
                                      <p className="text-sm text-zinc-500">
                                        {job.title}
                                      </p>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <Select
                                          value={job.currentStage}
                                          onValueChange={(newStage) => {
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
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <JobInspector />
    </div>
  );
}
