import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bugsTable = pgTable("bugs", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  reporterName: text("reporter_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBugSchema = createInsertSchema(bugsTable).omit({ id: true, createdAt: true });
export type InsertBug = z.infer<typeof insertBugSchema>;
export type Bug = typeof bugsTable.$inferSelect;
