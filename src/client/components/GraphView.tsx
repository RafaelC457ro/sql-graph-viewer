import { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from "reactflow";
import type { Node, Edge, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import { X } from "lucide-react";
import dagre from "dagre";

// Premium vibrant color palette for node types (Hex for better compatibility with SVG elements)
const COLOR_PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

const getColorForLabel = (label: string = "") => {
  if (!label) return "#3b82f6";
  // Simple hash for consistent color mapping
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};

// Custom Graph Entity Node
const GraphEntityNode = ({ data, selected }: NodeProps) => {
  const bgColor = getColorForLabel(data.vertexLabel || data.label);
  
  return (
    <div
      className={`relative flex flex-col items-center justify-center w-20 h-20 p-2 rounded-full border-2 
        ${selected ? "border-white ring-4 ring-white/30" : "border-white/10"} 
        shadow-xl transition-all hover:scale-105 active:scale-95 group`}
      style={{ backgroundColor: bgColor }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 !bg-white border-2 border-black/20" 
      />
      
      <div className="flex flex-col items-center justify-center text-center gap-0.5 px-1 overflow-hidden">
        <span className="text-[10px] font-black text-white max-w-[68px] line-clamp-2 leading-tight drop-shadow-sm">
          {data.label}
        </span>
        {data.vertexLabel && (
          <div className="mt-0.5 px-1.5 py-0.5 bg-black/20 rounded-full">
            <span className="text-[7px] font-medium text-white/90 uppercase tracking-wider block">
              {data.vertexLabel}
            </span>
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-white border-2 border-black/20" 
      />
    </div>
  );
};

// Properties Visualizer Component
const PropertiesPanel = ({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) => {
  if (!data) return null;

  const properties = data.properties || data;

  return (
    <div className="absolute top-4 right-4 w-72 bg-[oklch(0.12_0_0)]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Properties</span>
          <span className="text-xs font-semibold text-white leading-tight truncate max-w-[200px]">
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
          <div key={key} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-tight">
              {key}
            </span>
            <span className="text-xs text-white font-medium break-words">
              {typeof value === "object" ? (
                <pre className="text-[10px] mt-1 p-2 bg-black/30 rounded-md overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : String(value)}
            </span>
          </div>
        ))}
        {Object.keys(properties).length === 0 && (
          <div className="text-center py-4">
            <span className="text-xs text-muted-foreground italic">No properties found</span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeWidth = 80;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph({ multigraph: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: "TB", 
    marginx: 100, 
    marginy: 100,
    nodesep: 80,
    ranksep: 120
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    // Crucial for multigraph: use the edge ID to distinguish multiple relationships
    dagreGraph.setEdge(edge.source, edge.target, {}, edge.id);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { layoutedNodes, layoutedEdges: edges };
};

interface GraphViewProps {
  nodes?: Node[];
  edges?: Edge[];
}

export function GraphView({
  nodes: userNodes = [],
  edges: userEdges = [],
}: GraphViewProps) {
  const nodeTypes = useMemo(() => ({ entity: GraphEntityNode }), []);

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const nodes: Node[] = userNodes.map((n) => ({ 
      ...n, 
      type: "entity" 
    }));
    const edges: Edge[] = userEdges.map((e) => ({
      ...e,
      type: "smoothstep", // Use smoothstep for better visual connectivity
      labelShowBg: true,
      labelBgPadding: [4, 2],
      labelBgStyle: {
        fill: "#1a1a1a",
        rx: 4,
        stroke: "#333",
        strokeWidth: 1,
      },
      labelStyle: { fill: "#fefefe", fontSize: 10, fontWeight: 500 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#999" },
      style: { stroke: "#999", strokeWidth: 2 },
    }));

    if (nodes.length === 0) return { layoutedNodes: [], layoutedEdges: [] };

    return getLayoutedElements(nodes, edges);
  }, [userNodes, userEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedElement({ type: "node", ...node });
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedElement({ type: "edge", ...edge });
  }, []);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground uppercase tracking-widest text-xs font-semibold bg-[oklch(0.09_0_0)]">
        No graph data to visualize
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[oklch(0.09_0_0)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={4}
      >
        <Background gap={12} size={1} color="oklch(0.22 0 0)" />
        <Controls />
      </ReactFlow>

      {selectedElement && (
        <PropertiesPanel
          data={selectedElement.data}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
}
