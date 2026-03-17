import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from environment variables.");
}

// Disable prefetch for Supabase Transaction Pooler compatibility
const client = postgres(connectionString, { prepare: false });

// Singleton pattern for Next.js HMR
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? client;

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
