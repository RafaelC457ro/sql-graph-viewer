import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";
import { db } from "../db";
import { connections } from "../db/schema";
import { eq } from "drizzle-orm";
import { ConnectionManager } from "../services/ConnectionManager";
import { buildQueryResult } from "../utils/GraphBuilder";


export const connectionRoutes = new Elysia({ prefix: "/api" })
  .post("/connect", async ({ body, cookie: { sessionId }, set }) => {
    const { host, port, database, user, password, graph, category, name } = body;

    try {
      // 1. Generate new session ID
      const newSessionId = randomUUID();

      // 2. Save session to SQLite
      db.insert(connections).values({
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

    const connection = await db.query.connections.findFirst({
      where: eq(connections.id, id),
    });

    if (!connection) {
      set.status = 401;
      return { connected: false };
    }

    const config = connection.connectionConfig as any;

    return {
      connected: true,
      name: connection.name,
      category: connection.category,
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

      // 2. Clear cookie (No longer deleting connection from DB)

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
         data: buildQueryResult({
           columns: result.fields ? result.fields.map((f) => f.name) : [],
           rows: result.rows || [],
         }),
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
  .get("/connections", async () => {
    const allConnections = await db.query.connections.findMany({
      orderBy: (connections, { desc }) => [desc(connections.lastActiveAt)],
    });

    return allConnections.map(s => {
      const config = s.connectionConfig as any;
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        lastActiveAt: s.lastActiveAt,
        connection: {
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          graph: config.graph,
        }
      };
    });
  })
  .post("/connections/:id/activate", async ({ params: { id }, cookie: { sessionId }, set }) => {
    try {
      const connection = await db.query.connections.findFirst({
        where: eq(connections.id, id),
      });

      if (!connection) {
        set.status = 404;
        return { success: false, message: "Connection not found" };
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

      return { success: true };
    } catch (error) {
      set.status = 500;
      return { success: false, message: error instanceof Error ? error.message : "Failed to activate connection" };
    }
  })
  .delete("/connections/:id", async ({ params: { id }, set, cookie: { sessionId } }) => {
    try {
      const manager = ConnectionManager.getInstance();
      
      // If deleting the active session, disconnect it first
      if (sessionId?.value === id) {
        await manager.closeConnection(id);
        sessionId.remove();
      } else {
        await manager.closeConnection(id);
      }

      await db.delete(connections).where(eq(connections.id, id)).run();
      return { success: true };
    } catch (error) {
      set.status = 500;
      return { success: false, message: error instanceof Error ? error.message : "Failed to delete connection" };
    }
  })
  .patch("/connections/:id", async ({ params: { id }, body, set }) => {
    try {
      const { name, category, connectionConfig } = body;
      
      await db.update(connections)
        .set({ 
          ...(name && { name }), 
          ...(category && { category }),
          ...(connectionConfig && { connectionConfig }),
          updatedAt: new Date() 
        })
        .where(eq(connections.id, id))
        .run();

      return { success: true };
    } catch (error) {
      set.status = 500;
      return { success: false, message: error instanceof Error ? error.message : "Failed to update connection" };
    }
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      category: t.Optional(t.String()),
      connectionConfig: t.Optional(t.Any())
    })
  });
