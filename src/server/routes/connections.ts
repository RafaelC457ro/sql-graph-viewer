import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { db } from "../db";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { ConnectionManager } from "../services/ConnectionManager";


export const connectionRoutes = new Elysia({ prefix: "/api" })
  .post("/connect", async ({ body, cookie: { sessionId }, set }) => {
    const { host, port, database, user, password, graph, category, name } = body;

    try {
      // 1. Generate new session ID
      const newSessionId = randomUUID();

      // 2. Save session to SQLite
      db.insert(sessions).values({
        id: newSessionId,
        name: name || "Unnamed Server",
        category: (category as string) || "development",
        connectionConfig: {
            host,
            port,
            database,
            user,
            password,
            graph
        },
      }).run();

      // 3. Test connection via Manager (this validates credentials)
      const manager = ConnectionManager.getInstance();
      await manager.getConnection(newSessionId);

      // 4. Set cookie
      if (sessionId) {
          sessionId.set({
            value: newSessionId,
            httpOnly: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });
      }

      return { success: true, message: "Connected successfully" };
    } catch (error) {
      set.status = 400;
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to connect" 
      };
    }
  }, {
    body: t.Object({
      host: t.String(),
      port: t.String(),
      database: t.String(),
      user: t.String(),
      password: t.String(),
      graph: t.String(),
      category: t.Optional(t.String()),
      name: t.Optional(t.String())
    })
  })
  .get("/status", async ({ cookie: { sessionId }, set }) => {
    const id = sessionId?.value;
    if (typeof id !== "string") {
      set.status = 401;
      return { connected: false };
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
    });

    if (!session) {
      set.status = 401;
      return { connected: false };
    }

    const config = session.connectionConfig as any;

    return {
      connected: true,
      name: session.name,
      category: session.category,
      connection: {
        host: config.host,
        database: config.database,
        user: config.user,
        graph: config.graph,
      }
    };
  })
  .post("/disconnect", async ({ cookie: { sessionId } }) => {
    const id = sessionId?.value;
    if (typeof id !== "string") return { success: true };

    try {
      // 1. Close active connection
      const manager = ConnectionManager.getInstance();
      await manager.closeConnection(id);

      // 2. Remove from DB
      db.delete(sessions).where(eq(sessions.id, id)).run();

      // 3. Clear cookie
      if (sessionId) {
        sessionId.remove();
      }

      return { success: true };
    } catch (error) {
       console.error("Disconnect error:", error);
       return { success: false };
    }
  })
  .post("/query", async ({ body, cookie: { sessionId }, set }) => {
     const id = sessionId?.value;
     if (typeof id !== "string") {
        set.status = 401;
        return { success: false, message: "Not connected" };
     }

     const { query } = body;

     try {
       const manager = ConnectionManager.getInstance();
       const client = await manager.getConnection(id);
       
       const result = await client.query(query);
       
       return {
         success: true,
         data: {
            rows: result.rows,
            fields: result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID }))
         }
       };

     } catch (error) {
        set.status = 500;
        return { 
            success: false, 
            message: error instanceof Error ? error.message : "Query execution failed" 
        };
     }
  }, {
    body: t.Object({
        query: t.String()
    })
  })
  .get("/sessions", async () => {
    const allSessions = await db.query.sessions.findMany({
      orderBy: (sessions, { desc }) => [desc(sessions.lastActiveAt)],
    });

    return allSessions.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      lastActiveAt: s.lastActiveAt,
      connection: {
        host: (s.connectionConfig as any).host,
        database: (s.connectionConfig as any).database,
      }
    }));
  })
  .post("/sessions/:id/activate", async ({ params: { id }, cookie: { sessionId }, set }) => {
    try {
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, id),
      });

      if (!session) {
        set.status = 404;
        return { success: false, message: "Session not found" };
      }

      // Test connection
      const manager = ConnectionManager.getInstance();
      await manager.getConnection(id);

      // Set cookie
      if (sessionId) {
        sessionId.set({
          value: id,
          httpOnly: true,
          path: "/",
          maxAge: 7 * 24 * 60 * 60,
        });
      }

      // Update last active
      await db.update(sessions)
        .set({ lastActiveAt: new Date() })
        .where(eq(sessions.id, id))
        .run();

      return { success: true };
    } catch (error) {
      set.status = 500;
      return { success: false, message: error instanceof Error ? error.message : "Failed to activate session" };
    }
  });
