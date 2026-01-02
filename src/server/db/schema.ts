import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Folders table
export const folders = sqliteTable("folders", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Files table
export const files = sqliteTable("files", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "cascade" }),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});


// Sessions table for connection management
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // Using text because we'll generate UUIDs
  name: text("name").notNull().default("Unnamed Server"),
  connectionConfig: text("connection_config", { mode: "json" }).notNull(),
  category: text("category").notNull().default("development"), // production | development
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  lastActiveAt: integer("last_active_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
