import { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { X } from 'lucide-react';

// Custom Graph Entity Node
const GraphEntityNode = ({ data, selected }: NodeProps) => {
  return (
    <div 
      className={`relative flex flex-col items-center justify-center w-16 h-16 p-2 rounded-full border-2 
        ${selected ? 'border-white ring-2 ring-white/50' : 'border-[oklch(0.53_0.23_146)]'} 
        bg-[oklch(0.55_0.22_145)] shadow-lg transition-transform hover:scale-105`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex flex-col items-center justify-center text-center gap-0.5">
        <span className="text-[10px] font-bold text-white max-w-[80px] break-words leading-tight">
          {data.label}
        </span>
        {data.type && (
          <span className="text-[8px] text-white/80 max-w-[80px] truncate">
            {data.type}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// Properties Visualizer Component
const PropertiesPanel = ({ data, onClose }: { data: any; onClose: () => void }) => {
  if (!data) return null;

  return (
    <div className="absolute top-4 right-4 w-64 bg-[oklch(0.12_0_0)] border border-border rounded-lg shadow-xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
        <span className="text-xs font-semibold text-foreground">Properties</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-foreground font-mono">{key}</span>
            <span className="text-xs text-foreground font-medium break-words">
              {String(value)}
            </span>
          </div>
        ))}
        {Object.keys(data).length === 0 && (
          <span className="text-xs text-muted-foreground italic">No properties</span>
        )}
      </div>
    </div>
  );
};

// Fake Data Generator
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'graphNode',
    position: { x: 250, y: 50 },
    data: { label: 'Person', type: ':Label', name: 'Entity Node', count: 154 },
  },
  {
    id: '2',
    type: 'graphNode',
    position: { x: 100, y: 200 },
    data: { label: 'Alice', type: 'Person', age: 29, role: 'Developer' },
  },
  {
    id: '3',
    type: 'graphNode',
    position: { x: 400, y: 200 },
    data: { label: 'Bob', type: 'Person', age: 34, role: 'Manager' },
  },
  {
    id: '4',
    type: 'graphNode',
    position: { x: 250, y: 350 },
    data: { label: 'Matrix', type: 'Movie', released: 1999, tagline: 'Welcome to the Real World' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'DEFINES',
    type: 'default',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#999' },
    style: { stroke: '#999' },
    data: { since: 2023, active: true },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    label: 'DEFINES',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#999' },
    style: { stroke: '#999' },
    data: { since: 2021 },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    label: 'ACTED_IN',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#999' },
    style: { stroke: '#999' },
    data: { role: 'Neo' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    label: 'DIRECTED',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#999' },
    style: { stroke: '#999' },
  },
];

interface GraphViewProps {
  nodes?: Node[];
  edges?: Edge[];
}

export function GraphView({ nodes: userNodes, edges: userEdges }: GraphViewProps) {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const nodeTypes = useMemo(() => ({ graphNode: GraphEntityNode }), []);

  const transformNodes = (inputNodes?: any[]) => {
    if (inputNodes && inputNodes.length > 0) {
      return inputNodes.map((n: any, i) => ({
        id: n.id,
        type: 'graphNode',
        // Preserve position if it exists, otherwise calculate
        position: n.position || { x: 100 + (i * 150), y: 100 + (i % 2 * 100) },
        data: { label: n.label, type: 'Node', ...n }
      }));
    }
    return initialNodes;
  };

  const transformEdges = (inputEdges?: any[]) => {
    const rawEdges = (inputEdges && inputEdges.length > 0) ? inputEdges.map((e: any, i) => ({
      id: `e${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      data: { label: e.label, source: e.source, target: e.target },
    })) : initialEdges;

    return rawEdges.map(e => ({
      ...e,
      type: 'default',
      labelShowBg: true,
      labelBgStyle: { fill: 'oklch(0.12 0 0)', rx: 4, stroke: 'oklch(0.26 0 0)', strokeWidth: 1 },
      labelStyle: { fill: 'oklch(0.985 0 0)', fontSize: 10, fontWeight: 500 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'oklch(0.65 0 0)' },
      style: { stroke: 'oklch(0.65 0 0)', strokeWidth: 1.5 },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(transformNodes(userNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(transformEdges(userEdges));

  useEffect(() => {
    setNodes(transformNodes(userNodes));
    setEdges(transformEdges(userEdges));
  }, [userNodes, userEdges]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedElement({ type: 'node', ...node });
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedElement({ type: 'edge', ...edge });
  };

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
        maxZoom={2}
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
