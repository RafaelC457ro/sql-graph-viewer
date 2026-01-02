import { Client } from "pg";
import { db } from "../db";
import { sessions } from "../db/schema";
import { eq } from "drizzle-orm";

type ConnectionConfig = {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  graph?: string;
};

type ActiveConnection = {
  client: Client;
  lastActive: number;
};

export class ConnectionManager {
  private static instance: ConnectionManager;
  private clients: Map<string, ActiveConnection> = new Map();
  // Connection TTL in milliseconds (5 minutes)
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000;
  
  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public async getConnection(sessionId: string): Promise<Client> {
    // 1. Check if we have an active connection in memory
    const activeConn = this.clients.get(sessionId);
    if (activeConn) {
      activeConn.lastActive = Date.now();
      return activeConn.client;
    }

    // 2. If not, check if session exists in DB
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // 3. Create new connection
    const config = session.connectionConfig as ConnectionConfig;
    const client = new Client({
      host: config.host,
      port: config.port ? parseInt(config.port) : 5432,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    try {
      await client.connect();
      
      // Store in memory
      this.clients.set(sessionId, {
        client,
        lastActive: Date.now(),
      });

      // Update last active in DB (background)
      db.update(sessions)
        .set({ lastActiveAt: new Date() })
        .where(eq(sessions.id, sessionId))
        .run();

      return client;
    } catch (error) {
      console.error("Failed to connect to database:", error);
      throw new Error(`Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async closeConnection(sessionId: string): Promise<void> {
    const activeConn = this.clients.get(sessionId);
    if (activeConn) {
      try {
        await activeConn.client.end();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
      this.clients.delete(sessionId);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [sessionId, conn] of this.clients.entries()) {
      if (now - conn.lastActive > this.IDLE_TIMEOUT) {
        console.log(`Closing idle connection for session ${sessionId}`);
        this.closeConnection(sessionId);
      }
    }
  }
}
