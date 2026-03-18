import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums provide database-level constraints for the stages
export const stageEnum = pgEnum("job_stage", [
  "bookmarked",
  "applied",
  "phone_screen",
  "technical",
  "behavioral",
  "offer",
  "rejected",
]);

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  currentStage: stageEnum("current_stage").default("bookmarked").notNull(),

  resumePath: text("resume_path"),
  coverLetterPath: text("cover_letter_path"),
  jobDescriptionPath: text("job_description_path"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stageEvents = pgTable("stage_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  stage: stageEnum("stage").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobsRelations = relations(jobs, ({ many }) => ({
  stageEvents: many(stageEvents),
}));

export const stageEventsRelations = relations(stageEvents, ({ one }) => ({
  job: one(jobs, {
    fields: [stageEvents.jobId],
    references: [jobs.id],
  }),
}));
