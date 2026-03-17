"use client";

import { useJobStore } from "../store";
import { useJobs } from "../queries";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function JobInspector() {
  const { selectedJobId, closeInspector } = useJobStore();

  const { data: jobs } = useJobs();

  const job = jobs?.find((j) => j.id === selectedJobId);

  return (
    <Sheet
      open={!!selectedJobId}
      onOpenChange={(open) => !open && closeInspector()}
    >
      <SheetContent className="sm:max-w-md overflow-y-auto pl-5">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{job?.company}</SheetTitle>
          <SheetDescription className="text-base">
            {job?.title}
          </SheetDescription>
        </SheetHeader>

        {job && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Current Stage
              </h3>
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">
                {job.currentStage.replace("_", " ")}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Application Timeline
              </h3>
              <div className="space-y-4 border-l-2 border-zinc-200 ml-3 pl-4">
                {job.stageEvents.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-400 border-2 border-white" />
                    <p className="text-sm font-medium text-zinc-900">
                      Moved to {event.stage.replace("_", " ")}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(event.createdAt).toLocaleDateString()} at{" "}
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </p>
                    {event.notes && (
                      <p className="text-sm text-zinc-600 mt-1 bg-zinc-50 p-2 rounded-md">
                        {event.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
