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

// 1. The Job (Aggregate Root)
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  currentStage: stageEnum("current_stage").default("bookmarked").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. The Timeline (Event Sourcing Pattern)
export const stageEvents = pgTable("stage_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  stage: stageEnum("stage").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Drizzle Relations (For Type-Safe nested queries later)
export const jobsRelations = relations(jobs, ({ many }) => ({
  stageEvents: many(stageEvents),
}));

export const stageEventsRelations = relations(stageEvents, ({ one }) => ({
  job: one(jobs, {
    fields: [stageEvents.jobId],
    references: [jobs.id],
  }),
}));
