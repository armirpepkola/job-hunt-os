"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { createJobSchema } from "./schema";
import { createJobAction } from "./actions";

export async function parseJobTextAction(text: string) {
  try {
    if (!text || text.length < 10) throw new Error("No readable text provided");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: createJobSchema,
      prompt: `Analyze the following job description and extract the company name and the job title. 
               If the company name isn't explicitly stated, infer it from the context or use 'Unknown Company'.
               Always set the stage to 'bookmarked'.
               
               Job Description Text:
               ${text.substring(0, 15000)}`,
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
