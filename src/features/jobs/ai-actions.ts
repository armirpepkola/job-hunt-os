"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { createJobSchema } from "./schema";
import { createJobAction } from "./actions";

// the linter disabled here because pdf-parse is a legacy CommonJS
// package that lacks proper ES Module exports, breaking standard imports.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function parseJobDescriptionAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) throw new Error("No file uploaded");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: createJobSchema,
      prompt: `Analyze the following job description and extract the company name and the job title. 
               If the company name isn't explicitly stated, infer it from the context or use 'Unknown Company'.
               Always set the stage to 'bookmarked'.
               
               Job Description Text:
               ${rawText.substring(0, 15000)}`,
    });

    const result = await createJobAction(object);

    if (result.error) throw new Error(result.error);

    return { data: result.data, error: null };
  } catch (error) {
    console.error("AI Parsing Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to parse job description";
    return { data: null, error: message };
  }
}
