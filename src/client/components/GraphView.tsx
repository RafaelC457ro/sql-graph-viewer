import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Orbit, X } from "lucide-react";
import dagre from "dagre";
import { ReactFlowRenderer } from "./graph/ReactFlowRenderer";
import { CytoscapeRenderer } from "./graph/CytoscapeRenderer";
import {
  type CanvasControls,
  type NormalizedEdge,
  type NormalizedNode,
} from "./graph/graph-types";
import { getColorForLabel } from "./graph/graph-colors";
import { Button } from "./ui/button";
import { useGraphRenderer } from "@/hooks/useGraphRenderer";
import type { GraphResult } from "../../shared/types";

const PropertiesPanel = ({
  data,
  onClose,
}: {
  data: Record<string, any>;
  onClose: () => void;
}) => {
  if (!data) return null;

  const properties = data.properties || data;

  return (
    <div className="absolute top-4 right-4 w-72 bg-[oklch(0.12_0_0)]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
            Properties
          </span>
          <span className="text-xs font-semibold text-white leading-tight truncate max-w-50">
            {data.vertexLabel || data.edgeLabel || "Entity"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
        {Object.entries(properties).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0"
          >
            <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-tight">
              {key}
            </span>
            <span className="text-xs text-white font-medium wrap-break-word">
              {typeof value === "object" && value !== null ? (
                <pre className="text-[10px] mt-1 p-2 bg-black/30 rounded-md overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                String(value)
              )}
            </span>
          </div>
        ))}
        {Object.keys(properties).length === 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-muted-foreground italic">
              No properties found
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeWidth = 80;
const nodeHeight = 80;

type GraphNodeInput = GraphResult["nodes"][number];
type GraphEdgeInput = GraphResult["edges"][number];

const PHYSICS_STORAGE_KEY = "age-viewer.graph-physics";

const loadInitialPhysicsPreference = () => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(PHYSICS_STORAGE_KEY) === "true";
};

const persistPhysicsPreference = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(PHYSICS_STORAGE_KEY, value ? "true" : "false");
  } catch (error) {
    console.warn("Failed to persist physics preference", error);
  }
};

const normalizeGraphData = (
  nodes: GraphNodeInput[],
  edges: GraphEdgeInput[]
) => {
  if (nodes.length === 0) {
    return { nodes: [] as NormalizedNode[], edges: [] as NormalizedEdge[] };
  }

  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB",
    marginx: 100,
    marginy: 100,
    nodesep: 80,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {}, edge.id);
  });

  dagre.layout(dagreGraph);

  const normalizedNodes = nodes.map<NormalizedNode>((node) => {
    const layoutNode = dagreGraph.node(node.id) as
      | { x: number; y: number }
      | undefined;
    const data = node.data ? { ...node.data } : {};
    const vertexLabel =
      typeof data.vertexLabel === "string" ? data.vertexLabel : undefined;
    const label = typeof data.label === "string" ? data.label : undefined;
    const color: string = getColorForLabel(vertexLabel ?? label ?? node.id);

    return {
      id: node.id,
      data,
      position: layoutNode
        ? { x: layoutNode.x - nodeWidth / 2, y: layoutNode.y - nodeHeight / 2 }
        : node.position ?? { x: 0, y: 0 },
      color,
    };
  });

  const normalizedEdges: NormalizedEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: edge.data ? { ...edge.data } : {},
  }));

  return { nodes: normalizedNodes, edges: normalizedEdges };
};

interface GraphViewProps {
  nodes?: GraphNodeInput[];
  edges?: GraphEdgeInput[];
}

export function GraphView({
  nodes: userNodes = [],
  edges: userEdges = [],
}: GraphViewProps) {
  const { renderer } = useGraphRenderer();
  const [selectedData, setSelectedData] = useState<Record<string, any> | null>(
    null
  );
  const [physicsEnabled, setPhysicsEnabled] = useState(() =>
    loadInitialPhysicsPreference()
  );
  const controlsRef = useRef<CanvasControls | null>(null);
  const [controlsAvailable, setControlsAvailable] = useState(false);

  const normalized = useMemo(
    () => normalizeGraphData(userNodes, userEdges),
    [userNodes, userEdges]
  );
  const physicsAvailable = normalized.nodes.length > 1;

  useEffect(() => {
    if (!physicsAvailable && physicsEnabled) {
      setPhysicsEnabled((current) => {
        if (!current) {
          return current;
        }
        persistPhysicsPreference(false);
        return false;
      });
    }
  }, [physicsAvailable, physicsEnabled]);

  const handleSelect = useCallback((data: Record<string, any> | null) => {
    setSelectedData(data);
  }, []);

  const registerControls = useCallback((controls: CanvasControls | null) => {
    controlsRef.current = controls;
    setControlsAvailable(Boolean(controls));
  }, []);

  const handleZoomIn = useCallback(() => {
    controlsRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    controlsRef.current?.zoomOut();
  }, []);

  const handleResetView = useCallback(() => {
    controlsRef.current?.fitView();
  }, []);

  const handleTogglePhysics = useCallback(() => {
    setPhysicsEnabled((prev) => {
      const next = !prev;
      persistPhysicsPreference(next);
      return next;
    });
  }, []);

  useEffect(() => {
    setSelectedData(null);
  }, [renderer, userNodes, userEdges]);

  useEffect(() => {
    controlsRef.current = null;
    setControlsAvailable(false);
  }, [renderer]);

  if (normalized.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground uppercase tracking-widest text-xs font-semibold bg-[oklch(0.09_0_0)]">
        No graph data to visualize
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[oklch(0.09_0_0)]">
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2">
        <div className="flex items-center overflow-hidden rounded-md border border-white/10 bg-[oklch(0.12_0_0)]/85 shadow-lg backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleZoomIn}
            disabled={!controlsAvailable}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleZoomOut}
            disabled={!controlsAvailable}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleResetView}
            disabled={!controlsAvailable}
            title="Reset view"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant={physicsEnabled ? "secondary" : "outline"}
          size="sm"
          className="h-8 gap-1 px-3 text-xs"
          onClick={handleTogglePhysics}
          disabled={!physicsAvailable}
          title="Toggle physics layout"
        >
          <Orbit className="h-4 w-4" />
          <span>{physicsEnabled ? "Physics on" : "Physics off"}</span>
        </Button>
      </div>

      {renderer === "cytoscape" ? (
        <CytoscapeRenderer
          nodes={normalized.nodes}
          edges={normalized.edges}
          physicsEnabled={physicsEnabled}
          onSelect={handleSelect}
          registerControls={registerControls}
        />
      ) : (
        <ReactFlowRenderer
          nodes={normalized.nodes}
          edges={normalized.edges}
          physicsEnabled={physicsEnabled}
          onSelect={handleSelect}
          registerControls={registerControls}
        />
      )}

      {selectedData !== null && (
        <PropertiesPanel
          data={selectedData}
          onClose={() => setSelectedData(null)}
        />
      )}
    </div>
  );
}
