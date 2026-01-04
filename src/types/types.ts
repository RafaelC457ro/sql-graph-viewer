import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { files, folders } from "../server/db/schema";
import { z } from "zod";

// File schemas
export const fileSelectSchema = createSelectSchema(files);
export const fileInsertSchema = createInsertSchema(files, {
  name: (schema) => schema.min(1, "Name is required"),
  content: (schema) => schema.min(1, "Content is required"),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type File = z.infer<typeof fileSelectSchema>;
export type NewFile = z.infer<typeof fileInsertSchema>;

// Folder schemas
export const folderSelectSchema = createSelectSchema(folders);
export const folderInsertSchema = createInsertSchema(folders, {
  name: (schema) => schema.min(1, "Name is required"),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Folder = z.infer<typeof folderSelectSchema>;
export type NewFolder = z.infer<typeof folderInsertSchema>;

export type TableResult = {
  kind: "table";
  columns: string[];
  rows: any[];
};

export type GraphResult = {
  kind: "graph";
  columns: string[];
  rows: any[];
  nodes: Array<{
    id: string;
    position: { x: number; y: number };
    data: Record<string, any>;
    type?: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: Record<string, any>;
    type?: string;
  }>;
};

export type QueryResult = TableResult | GraphResult;
