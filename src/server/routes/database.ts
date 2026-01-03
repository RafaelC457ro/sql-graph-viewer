import { Elysia, t } from "elysia";
import { ConnectionManager } from "../services/ConnectionManager";

export const databaseRoutes = new Elysia({ prefix: "/api/database" })
  .get("/tables", async ({ cookie: { sessionId }, set }) => {
    const id = sessionId?.value;
    if (typeof id !== "string") {
      set.status = 401;
      return { success: false, message: "Not connected" };
    }

    try {
      const manager = ConnectionManager.getInstance();
      const client = await manager.getConnection(id);
      
      const result = await client.query(`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename ASC;
      `);
      
      return {
        success: true,
        tables: result.rows.map(row => row.tablename)
      };
    } catch (error) {
      set.status = 500;
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch tables" 
      };
    }
  })
  .get("/graphs", async ({ cookie: { sessionId }, set }) => {
    const id = sessionId?.value;
    if (typeof id !== "string") {
      set.status = 401;
      return { success: false, message: "Not connected" };
    }

    try {
      const manager = ConnectionManager.getInstance();
      const client = await manager.getConnection(id);
      
      const result = await client.query(`
        SELECT name FROM ag_catalog.ag_graph ORDER BY name ASC;
      `);
      
      return {
        success: true,
        graphs: result.rows.map(row => row.name)
      };
    } catch (error) {
       // If AGE is not installed, ag_catalog.ag_graph might not exist
       return { success: true, graphs: [] };
    }
  })
  .get("/graph-items", async ({ query: { graph }, cookie: { sessionId }, set }) => {
    const id = sessionId?.value;
    if (typeof id !== "string") {
      set.status = 401;
      return { success: false, message: "Not connected" };
    }

    if (!graph) {
      set.status = 400;
      return { success: false, message: "Graph name is required" };
    }

    try {
      const manager = ConnectionManager.getInstance();
      const client = await manager.getConnection(id);
      
      // 1. Get labels
      const labelsResult = await client.query(`
        SELECT name, kind 
        FROM ag_catalog.ag_label 
        WHERE graph = (SELECT graphid FROM ag_catalog.ag_graph WHERE name = $1);
      `, [graph]);

      const nodes = [];
      const edges = [];

      for (const row of labelsResult.rows) {
        // 2. Get counts for each label
        // Note: Using double quotes for schema and table names to handle special characters
        try {
            const countResult = await client.query(`SELECT count(*) FROM "${graph}"."${row.name}"`);
            const item = { name: row.name, count: parseInt(countResult.rows[0].count) };
            if (row.kind === 'v') {
              nodes.push(item);
            } else if (row.kind === 'e') {
              edges.push(item);
            }
        } catch (e) {
            console.error(`Failed to get count for label ${row.name} in graph ${graph}`, e);
        }
      }
      
      return {
        success: true,
        nodes: nodes.sort((a, b) => a.name.localeCompare(b.name)),
        edges: edges.sort((a, b) => a.name.localeCompare(b.name))
      };
    } catch (error) {
      set.status = 500;
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch graph items" 
      };
    }
  }, {
    query: t.Object({
      graph: t.Optional(t.String())
    })
  });
