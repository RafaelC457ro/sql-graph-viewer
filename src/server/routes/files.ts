import { Elysia, t } from "elysia";
import { db } from "../db";
import { files } from "../db/schema";
import { eq, like } from "drizzle-orm";
import { fileInsertSchema } from "../../types/types";

export const filesRoutes = new Elysia({ prefix: "/api/db/files" })
  // GET all files with optional search
  .get("/", async ({ query }) => {
    try {
      const searchTerm = query.search as string | undefined;
      
      if (searchTerm) {
        const results = await db
          .select()
          .from(files)
          .where(like(files.name, `%${searchTerm}%`))
          .all();
        return results;
      }
      
      const all = await db.select().from(files).all();
      return all;
    } catch (e) {
      console.error(e);
      return new Response("Internal Error", { status: 500 });
    }
  })
  
  // CREATE new file
  .post(
    "/",
    async ({ body }) => {
      try {
        const result = await db
          .insert(files)
          .values({
            name: body.name,
            content: body.content,
            folderId: body.folderId,
            isFavorite: body.isFavorite,
          })
          .returning();
        return result[0];
      } catch (e) {
        console.error(e);
        return new Response("Error creating file", { status: 500 });
      }
    },
    {
      body: fileInsertSchema,
    }
  )
  
  // UPDATE file (full update)
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const result = await db
          .update(files)
          .set({
            name: body.name,
            content: body.content,
            folderId: body.folderId,
            isFavorite: body.isFavorite,
            updatedAt: new Date(),
          })
          .where(eq(files.id, parseInt(id)))
          .returning();
        return result[0];
      } catch (e) {
        console.error(e);
        return new Response("Error updating", { status: 500 });
      }
    },
    {
      body: fileInsertSchema,
    }
  )
  
  // PATCH file (partial update - for rename/favorite)
  .patch(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        
        if (body.name !== undefined) updateData.name = body.name;
        if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite;
        if (body.folderId !== undefined) updateData.folderId = body.folderId;
        
        const result = await db
          .update(files)
          .set(updateData)
          .where(eq(files.id, parseInt(id)))
          .returning();
        return result[0];
      } catch (e) {
        console.error(e);
        return new Response("Error patching file", { status: 500 });
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        isFavorite: t.Optional(t.Boolean()),
        folderId: t.Optional(t.Union([t.Number(), t.Null()])),
      }),
    }
  )
  
  // DELETE file
  .delete("/:id", async ({ params: { id } }) => {
    try {
      await db.delete(files).where(eq(files.id, parseInt(id)));
      return new Response(null, { status: 204 });
    } catch (e) {
      console.error(e);
      return new Response("Error deleting", { status: 500 });
    }
  });

