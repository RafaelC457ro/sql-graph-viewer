import { useEffect, useRef } from "react";

interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphView({ nodes, edges }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple force-directed layout simulation
  useEffect(() => {
    if (!nodes.length) return;

    // Initialize positions if not set
    nodes.forEach((node, i) => {
      if (node.x === undefined) {
        const angle = (2 * Math.PI * i) / nodes.length;
        const radius = 150;
        node.x = 250 + radius * Math.cos(angle);
        node.y = 200 + radius * Math.sin(angle);
      }
    });
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p>No graph data to display.</p>
          <p className="text-sm mt-1">Run a graph query to see nodes and edges.</p>
        </div>
      </div>
    );
  }

  // Calculate node positions
  const positionedNodes = nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const radius = 120;
    return {
      ...node,
      x: 250 + radius * Math.cos(angle),
      y: 180 + radius * Math.sin(angle),
    };
  });

  const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

  return (
    <div ref={containerRef} className="h-full w-full bg-muted/20 overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 500 360">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="24"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--muted-foreground))"
            />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return null;

          return (
            <g key={i}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                markerEnd="url(#arrowhead)"
              />
              {edge.label && (
                <text
                  x={(source.x! + target.x!) / 2}
                  y={(source.y! + target.y!) / 2 - 8}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => (
          <g key={node.id} className="cursor-pointer">
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="2"
              className="transition-all hover:r-[22]"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-primary-foreground font-medium pointer-events-none"
            >
              {node.label.slice(0, 3)}
            </text>
            <text
              x={node.x}
              y={node.y! + 32}
              textAnchor="middle"
              className="text-xs fill-foreground"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
