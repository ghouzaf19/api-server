import { pgTable, text, uuid, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const blogPostsTable = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic: text("topic").notNull(),
  niche: text("niche").notNull(),
  title: text("title").notNull(),
  slug: text("slug").unique(),
  featuredImage: text("featured_image"),
  pinterestImage: text("pinterest_image"),
  outline: text("outline").notNull(),
  content: text("content").notNull(),
  seoScore: numeric("seo_score", { precision: 5, scale: 2 }).notNull().default("0"),
  wordCount: integer("word_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const slugRedirectsTable = pgTable("slug_redirects", {
  oldSlug: text("old_slug").primaryKey(),
  postId: uuid("post_id").notNull().references(() => blogPostsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type SlugRedirect = typeof slugRedirectsTable.$inferSelect;
