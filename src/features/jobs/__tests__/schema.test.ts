import { describe, it, expect } from "vitest";
import { createJobSchema } from "../schema";

describe("Job Schema Validation", () => {
  it("should accept a valid job payload", () => {
    const validData = {
      company: "Google",
      title: "Senior Software Engineer",
      stage: "applied",
    };

    const result = createJobSchema.safeParse(validData);

    if (!result.success) {
      console.error("ZOD REJECTION REASON:", result.error.format());
    }

    expect(result.success).toBe(true);
  });

  it("should reject a payload with a missing company", () => {
    const invalidData = {
      title: "Frontend Developer",
      stage: "bookmarked",
    };

    const result = createJobSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const hasCompanyError = result.error.issues.some((issue) =>
        issue.path.includes("company"),
      );
      expect(hasCompanyError).toBe(true);
    }
  });

  it("should reject a payload with an invalid stage", () => {
    const invalidData = {
      company: "Vercel",
      title: "Full Stack Engineer",
      stage: "hired_immediately",
    };

    const result = createJobSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
