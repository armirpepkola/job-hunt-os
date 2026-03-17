"use client";

import { useRef, useState } from "react";
import { useJobStore } from "../store";
import { useJobs, useUploadDocument } from "../queries";
import { getDocumentUrlAction } from "../actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud, Loader2 } from "lucide-react";

export function JobInspector() {
  const { selectedJobId, closeInspector } = useJobStore();
  const { data: jobs } = useJobs();
  const uploadDoc = useUploadDocument();

  const job = jobs?.find((j) => j.id === selectedJobId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<
    "resumePath" | "coverLetterPath" | null
  >(null);

  // Handle the hidden file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !job || !uploadType) return;

    const formData = new FormData();
    formData.append("jobId", job.id);
    formData.append("file", file);
    formData.append("type", uploadType);

    uploadDoc.mutate(formData);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadType(null);
  };

  // Trigger the hidden file input
  const triggerUpload = (type: "resumePath" | "coverLetterPath") => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  // Securely fetch the signed URL and open it in a new tab
  const handleViewDocument = async (path: string | null) => {
    if (!path) return;
    const { data, error } = await getDocumentUrlAction(path);
    if (error) return alert("Failed to load document");
    if (data) window.open(data, "_blank");
  };

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
          <div className="space-y-8">
            {/* Current Stage */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Current Stage
              </h3>
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">
                {job.currentStage.replace("_", " ")}
              </span>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Documents
              </h3>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
              />

              <div className="space-y-3">
                {/* Resume Row */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Resume
                  </div>
                  {job.resumePath ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(job.resumePath)}
                    >
                      View PDF
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerUpload("resumePath")}
                      disabled={uploadDoc.isPending}
                    >
                      {uploadDoc.isPending && uploadType === "resumePath" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4 mr-2" />
                      )}
                      Upload
                    </Button>
                  )}
                </div>

                {/* Cover Letter Row */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Cover Letter
                  </div>
                  {job.coverLetterPath ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(job.coverLetterPath)}
                    >
                      View PDF
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerUpload("coverLetterPath")}
                      disabled={uploadDoc.isPending}
                    >
                      {uploadDoc.isPending &&
                      uploadType === "coverLetterPath" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4 mr-2" />
                      )}
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Application Timeline
              </h3>
              <div className="space-y-4 border-l-2 border-zinc-200 ml-3 pl-4">
                {job.stageEvents.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-5.25 top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-400 border-2 border-white" />
                    <p className="text-sm font-medium text-zinc-900">
                      {event.notes?.includes("Uploaded")
                        ? event.notes
                        : `Moved to ${event.stage.replace("_", " ")}`}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(event.createdAt).toLocaleDateString()} at{" "}
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </p>
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
