import { Elysia, t } from "elysia";
import { db } from "../db";
import { folders, files } from "../db/schema";
import { eq } from "drizzle-orm";

export const foldersRoutes = new Elysia({ prefix: "/api/db/folders" })
  // GET all folders
  .get("/", async () => {
    try {
      const all = await db.select().from(folders).all();
      return all;
    } catch (e) {
      console.error(e);
      return new Response("Internal Error", { status: 500 });
    }
  })
  
  // CREATE new folder
  .post(
    "/",
    async ({ body }) => {
      try {
        const result = await db
          .insert(folders)
          .values({ name: body.name })
          .returning();
        return result[0];
      } catch (e) {
        console.error(e);
        return new Response("Error creating folder", { status: 500 });
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    }
  )
  
  // PATCH folder (rename)
  .patch(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const result = await db
          .update(folders)
          .set({ name: body.name, updatedAt: new Date() })
          .where(eq(folders.id, parseInt(id)))
          .returning();
        return result[0];
      } catch (e) {
        console.error(e);
        return new Response("Error updating folder", { status: 500 });
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
      }),
    }
  )
  
  // DELETE folder (cascade deletes files)
  .delete("/:id", async ({ params: { id } }) => {
    try {
      // Delete all files in folder first
      await db.delete(files).where(eq(files.folderId, parseInt(id)));
      // Delete folder
      await db.delete(folders).where(eq(folders.id, parseInt(id)));
      return new Response(null, { status: 204 });
    } catch (e) {
      console.error(e);
      return new Response("Error deleting folder", { status: 500 });
    }
  });
