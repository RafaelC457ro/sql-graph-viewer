import type { QueryResult } from "../../shared/types";

export interface ConnectionParams {
  host?: string;
  port?: string;
  database?: string;
  user?: string;
  password?: string;
  graph?: string;
  category?: string;
  name?: string;
}

export interface ConnectionDefinition {
  id: string;
  name: string;
  category: string;
  lastActiveAt: string;
  connection: {
    host: string;
    database: string;
    user?: string;
    port?: string;
    graph?: string;
  }
}

export interface SessionStatus {
  id?: string;
  connected: boolean;
  name?: string;
  category?: string;
  lastActiveAt?: string;
  connection?: {
    host: string;
    database: string;
    user?: string;
    port?: string;
    graph?: string;
  }
}

export const connectToDatabase = async (params: ConnectionParams) => {
  const res = await fetch("/api/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to connect");
  }

  return data;
};

export const disconnectFromDatabase = async () => {
  const res = await fetch("/api/disconnect", { method: "POST" });
  if (!res.ok) {
     throw new Error("Failed to disconnect");
  }
  return res.json();
};

export const getSessionStatus = async (): Promise<SessionStatus> => {
  const res = await fetch("/api/status");
  if (!res.ok && res.status !== 401) {
    throw new Error("Failed to check session status");
  }
  return res.json();
};

export const executeQuery = async (query: string): Promise<QueryResult> => {
    const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    });

    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.message || "Query failed");
    }
    
    return data.data;
}

export const getSavedConnections = async (): Promise<ConnectionDefinition[]> => {
  const res = await fetch("/api/connections");
  if (!res.ok) {
    throw new Error("Failed to fetch saved connections");
  }
  return res.json();
};

export const activateConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}/activate`, {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to activate connection");
  }
  return data;
};

export interface UpdateConnectionParams {
  name?: string;
  category?: string;
  connectionConfig?: any;
}

export async function deleteConnection(id: string) {
  const res = await fetch(`/api/connections/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete connection");
  }
  return res.json();
}

export async function updateConnection(id: string, params: UpdateConnectionParams) {
  const res = await fetch(`/api/connections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error("Failed to update connection");
  }
  return res.json();
}
