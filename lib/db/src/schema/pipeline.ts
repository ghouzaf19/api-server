import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { blogPostsTable } from "./blog-posts";

export type PipelineStatus = "pending" | "running" | "done" | "failed" | "paused";
export type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface StepState {
  id: string;
  label: string;
  status: StepStatus;
  output?: unknown;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface PipelineContext {
  keyword: string;
  niche: string;
  topicalAuthority?: Record<string, unknown>;
  redditMiner?: Record<string, unknown>;
  infoGain?: Record<string, unknown>;
  blogPost?: Record<string, unknown>;
  eeatEnhanced?: Record<string, unknown>;
  imageSeo?: Record<string, unknown>;
  qualityCheck?: Record<string, unknown>;
  googleAudit?: Record<string, unknown>;
}

export const pipelineRunsTable = pgTable("pipeline_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyword: text("keyword").notNull(),
  niche: text("niche").notNull(),
  preset: text("preset").notNull().default("full-seo"),
  enabledSteps: text("enabled_steps").array().notNull().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("pending"),
  steps: jsonb("steps").$type<StepState[]>().notNull().default(sql`'[]'::jsonb`),
  context: jsonb("context").$type<PipelineContext>().notNull().default(sql`'{}'::jsonb`),
  logs: text("logs").array().notNull().default(sql`ARRAY[]::text[]`),
  savedPostId: uuid("saved_post_id").references(() => blogPostsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type PipelineRun = typeof pipelineRunsTable.$inferSelect;
