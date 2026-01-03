export async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok && res.status !== 401) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `API error: ${res.status}`);
  }
  return res.json();
}

export interface DatabaseItem {
  name: string;
  count?: number;
}

export interface TablesResponse {
  success: boolean;
  tables: string[];
  message?: string;
}

export interface GraphsResponse {
  success: boolean;
  graphs: string[];
  message?: string;
}

export interface GraphItemsResponse {
  success: boolean;
  nodes: DatabaseItem[];
  edges: DatabaseItem[];
  message?: string;
}

export const getTables = async (): Promise<TablesResponse> => {
  const res = await fetch("/api/database/tables");
  if (!res.ok && res.status !== 401) {
    throw new Error("Failed to fetch tables");
  }
  return res.json();
};

export const getGraphs = async (): Promise<GraphsResponse> => {
  const res = await fetch("/api/database/graphs");
  if (!res.ok && res.status !== 401) {
    throw new Error("Failed to fetch graphs");
  }
  return res.json();
};

export const getGraphItems = async (graph: string): Promise<GraphItemsResponse> => {
  const res = await fetch(`/api/database/graph-items?graph=${encodeURIComponent(graph)}`);
  if (!res.ok && res.status !== 401) {
    throw new Error("Failed to fetch graph items");
  }
  return res.json();
};
