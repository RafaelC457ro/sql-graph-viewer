import type { QueryResult, TableResult, GraphResult } from "../../shared/types";

type AgeTagged =
  | { __agKind: "vertex"; id: any; label: string; properties?: any }
  | {
      __agKind: "edge";
      id: any;
      label: string;
      start_id: any;
      end_id: any;
      properties?: any;
    }
  | { __agKind: string; [k: string]: any };

const AGE_REGEX = /::(vertex|edge|path)\s*$/;

/**
 * Builds a QueryResult from raw rows and columns.
 * Detects if the result contains Apache AGE graph elements and transforms them
 * into React Flow compatible nodes and edges if found.
 */
export function buildQueryResult(input: {
  columns: string[];
  rows: any[];
}): QueryResult {
  const { columns, rows = [] } = input;

  // 1. Detect if any value matches AGE graph markers
  let isGraphData = false;
  const sampleRows = rows.slice(0, 50);
  for (const row of sampleRows) {
    for (const key in row) {
      const val = row[key];
      if (typeof val === "string" && AGE_REGEX.test(val)) {
        isGraphData = true;
        break;
      }
    }
    if (isGraphData) break;
  }

  if (!isGraphData) {
    return { kind: "table", columns, rows };
  }

  // 2. Parse and collect graph data
  const nodesMap = new Map<string, any>();
  const edgesMap = new Map<string, any>();

  function walk(value: any): any {
    if (typeof value === "string") {
      const parsed = parseAgeValue(value);
      if (parsed && typeof parsed === "object" && "__agKind" in parsed) {
        if (parsed.__agKind === "vertex") {
          const internalId = String(parsed.id);
          if (parsed.id !== undefined && !nodesMap.has(internalId)) {
            nodesMap.set(internalId, parsed);
          }
        } else if (parsed.__agKind === "edge") {
          const edgeId = String(parsed.id);
          if (parsed.id !== undefined && !edgesMap.has(edgeId)) {
            edgesMap.set(edgeId, parsed);
          }
        } else if (parsed.__agKind === "path") {
          if (Array.isArray(parsed.elements)) {
            parsed.elements.forEach((el: any) => {
              if (el && typeof el === "object" && "__agKind" in el) {
                if (el.__agKind === "vertex") {
                  const internalId = String(el.id);
                  if (el.id !== undefined && !nodesMap.has(internalId)) {
                    nodesMap.set(internalId, el);
                  }
                } else if (el.__agKind === "edge") {
                  const edgeId = String(el.id);
                  if (el.id !== undefined && !edgesMap.has(edgeId)) {
                    edgesMap.set(edgeId, el);
                  }
                }
              }
            });
          }
        }
        return parsed;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (value !== null && typeof value === "object") {
      const result: Record<string, any> = {};
      for (const key in value) {
        result[key] = walk(value[key]);
      }
      return result;
    }

    return value;
  }

  // Recursively walk all rows to collect vertices and edges
  rows.forEach((row) => walk(row));

  // internalVertexId -> reactFlowNodeId mapping
  const internalToUiId = new Map<string, string>();

  // Transform collected vertices to React Flow nodes
  const nodes = Array.from(nodesMap.values()).map((v) => {
    const internalId = String(v.id);
    const uiId =
      v.properties?.id && typeof v.properties.id === "string"
        ? v.properties.id
        : internalId;

    internalToUiId.set(internalId, uiId);

    const label =
      v.properties?.name || v.properties?.title || v.label || uiId;

    return {
      id: uiId,
      position: { x: 0, y: 0 },
      data: {
        label,
        kind: "vertex",
        vertexLabel: v.label,
        properties: v.properties || {},
        __internalId: internalId,
      },
    };
  });

  // Transform collected edges to React Flow edges
  const edges = Array.from(edgesMap.values()).map((e) => {
    const startId = String(e.start_id);
    const endId = String(e.end_id);
    const source = internalToUiId.get(startId) || startId;
    const target = internalToUiId.get(endId) || endId;

    return {
      id: String(e.id),
      source,
      target,
      label: e.label,
      data: {
        kind: "edge",
        edgeLabel: e.label,
        properties: e.properties || {},
        __internalStartId: startId,
        __internalEndId: endId,
      },
    };
  });

  return {
    kind: "graph",
    columns,
    rows,
    nodes,
    edges,
  };
}

/**
 * Parses a single AGE string value or returns the original if not a tagged AGE string.
 */
function parseAgeValue(val: string): any {
  const match = val.match(AGE_REGEX);
  if (!match) return val;

  const type = match[1];
  let jsonPart = val.replace(AGE_REGEX, "").trim();

  try {
    if (type === "path") {
      // Transform internal tagged elements to valid JSON by injecting __agKind
      // This is a heuristic but works for standard ::vertex and ::edge suffixes
      const transformed = jsonPart
        .replace(/\}::vertex/g, ', "__agKind": "vertex"}')
        .replace(/\}::edge/g, ', "__agKind": "edge"}');
      
      const parsed = JSON.parse(transformed);
      if (Array.isArray(parsed)) {
        return {
          __agKind: "path",
          elements: parsed,
        };
      }
    } else {
      if (
        jsonPart.startsWith("{") ||
        jsonPart.startsWith("[") ||
        jsonPart === "null"
      ) {
        const parsed = JSON.parse(jsonPart);
        if (parsed && typeof parsed === "object") {
          return {
            ...parsed,
            __agKind: type,
          };
        }
      }
    }
  } catch (e) {
    // Ignore JSON parse errors for robust handling
  }

  return val;
}
