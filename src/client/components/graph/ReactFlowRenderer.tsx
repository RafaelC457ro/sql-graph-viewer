import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent,
} from "react";
import ReactFlow, {
  Background,
  Handle,
  Position,
  MarkerType,
  useEdgesState,
  useNodesState,
  type Edge as ReactFlowEdge,
  type Node as ReactFlowNode,
  type NodeProps,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { getColorForLabel } from "./graph-colors";
import type {
  CanvasControls,
  NormalizedEdge,
  NormalizedNode,
} from "./graph-types";

interface ForceNode extends SimulationNodeDatum {
  id: string;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
}

const COLOR_PROP = "__graphColor";

const GraphEntityNode = ({ data, selected }: NodeProps) => {
  const bgColor =
    (typeof data[COLOR_PROP] === "string" && (data as any)[COLOR_PROP]) ??
    getColorForLabel(data.vertexLabel || data.label || "");

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-20 h-20 p-2 rounded-full border-2 \
        ${selected ? "border-white ring-4 ring-white/30" : "border-white/10"} \
        shadow-xl transition-all hover:scale-105 active:scale-95 group`}
      style={{ backgroundColor: bgColor as string }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-white! border-2 border-black/20"
      />
      <div className="w-2 h-2 bg-white! border-2 border-black/20 rounded-full absolute -top-1" />
      <div className="flex flex-col items-center justify-center text-center gap-0.5 px-1 overflow-hidden">
        <span className="text-[10px] font-black text-white max-w-17 line-clamp-2 leading-tight drop-shadow-sm">
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
      <div className="w-2 h-2 bg-white! border-2 border-black/20 rounded-full absolute -bottom-1" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-white! border-2 border-black/20"
      />
    </div>
  );
};

interface ReactFlowRendererProps {
  nodes: NormalizedNode[];
  edges: NormalizedEdge[];
  physicsEnabled: boolean;
  onSelect: (data: Record<string, any> | null) => void;
  registerControls: (controls: CanvasControls | null) => void;
}

export function ReactFlowRenderer({
  nodes,
  edges,
  physicsEnabled,
  onSelect,
  registerControls,
}: ReactFlowRendererProps) {
  const nodeTypes = useMemo(() => ({ entity: GraphEntityNode }), []);

  const reactFlowNodes = useMemo<ReactFlowNode[]>(
    () =>
      nodes.map((node) => ({
        id: node.id,
        data: {
          ...node.data,
          [COLOR_PROP]: node.color,
        },
        position: node.position,
        type: "entity",
      })),
    [nodes]
  );

  const reactFlowEdges = useMemo<ReactFlowEdge[]>(
    () =>
      edges.map((edge) => {
        const baseData = edge.data ?? {};
        const edgeLabel =
          typeof baseData.edgeLabel === "string"
            ? baseData.edgeLabel
            : edge.label;
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "smoothstep",
          data: edgeLabel ? { ...baseData, edgeLabel } : baseData,
          label: edge.label,
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
        } as ReactFlowEdge;
      }),
    [edges]
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(reactFlowEdges);
  const instanceRef = useRef<ReactFlowInstance | null>(null);
  const simulationRef = useRef<Simulation<ForceNode, ForceLink> | null>(null);

  const provideControls = useCallback(() => {
    const instance = instanceRef.current;
    if (!instance) {
      registerControls(null);
      return;
    }
    registerControls({
      zoomIn: () => instance.zoomIn({ duration: 150 }),
      zoomOut: () => instance.zoomOut({ duration: 150 }),
      fitView: () => instance.fitView({ padding: 0.15, duration: 200 }),
    });
  }, [registerControls]);

  useEffect(() => {
    provideControls();
    return () => {
      registerControls(null);
    };
  }, [provideControls, registerControls]);

  useEffect(() => {
    if (physicsEnabled) {
      return;
    }
    setRfNodes(reactFlowNodes);
  }, [reactFlowNodes, setRfNodes, physicsEnabled]);

  useEffect(() => {
    setRfEdges(reactFlowEdges);
  }, [reactFlowEdges, setRfEdges]);

  useEffect(() => {
    if (!physicsEnabled) {
      simulationRef.current?.stop();
      simulationRef.current = null;
      setRfNodes(reactFlowNodes);
      return;
    }

    if (reactFlowNodes.length === 0) {
      return;
    }

    simulationRef.current?.stop();

    const simNodes: ForceNode[] = reactFlowNodes.map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));

    const nodeMap = new Map<string, ForceNode>();
    simNodes.forEach((entry) => {
      nodeMap.set(entry.id, entry);
    });

    const links: ForceLink[] = reactFlowEdges.map((edge) => ({
      source: edge.source,
      target: edge.target,
    }));

    const avgX =
      simNodes.reduce((acc, item) => acc + (item.x ?? 0), 0) / simNodes.length;
    const avgY =
      simNodes.reduce((acc, item) => acc + (item.y ?? 0), 0) / simNodes.length;

    const simulation = forceSimulation<ForceNode>(simNodes)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(links)
          .id((d) => d.id)
          .distance(180)
          .strength(0.12)
      )
      .force("charge", forceManyBody().strength(-420))
      .force("center", forceCenter(avgX, avgY))
      .alpha(1)
      .alphaDecay(0.02);

    simulation.on("tick", () => {
      setRfNodes((current) =>
        current.map((node) => {
          const simNode = nodeMap.get(node.id);
          if (!simNode || simNode.x === undefined || simNode.y === undefined) {
            return node;
          }
          return {
            ...node,
            position: {
              x: simNode.x,
              y: simNode.y,
            },
          };
        })
      );
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [physicsEnabled, reactFlowNodes, reactFlowEdges, setRfNodes]);

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      instanceRef.current = instance;
      provideControls();
      instance.fitView({ padding: 0.15, duration: 0 });
    },
    [provideControls]
  );

  const handleNodeClick = useCallback(
    (_: MouseEvent, node: ReactFlowNode) => {
      const payload = { ...(node.data ?? {}) };
      delete (payload as any)[COLOR_PROP];
      onSelect(
        Object.keys(payload).length > 0
          ? (payload as Record<string, any>)
          : null
      );
    },
    [onSelect]
  );

  const handleEdgeClick = useCallback(
    (_: MouseEvent, edge: ReactFlowEdge) => {
      const base = (edge.data ?? {}) as Record<string, any>;
      const edgeLabel =
        typeof base.edgeLabel === "string" ? base.edgeLabel : edge.label;
      const payload = edgeLabel ? { ...base, edgeLabel } : base;
      onSelect(Object.keys(payload).length > 0 ? payload : null);
    },
    [onSelect]
  );

  const handlePaneClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      onPaneClick={handlePaneClick}
      onInit={handleInit}
      fitView
      className="bg-transparent"
      minZoom={0.5}
      maxZoom={4}
    >
      <Background gap={12} size={1} color="oklch(0.22 0 0)" />
    </ReactFlow>
  );
}
