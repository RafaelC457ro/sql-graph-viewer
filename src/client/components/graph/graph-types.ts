export interface NormalizedNode {
  id: string;
  data: Record<string, any>;
  position: { x: number; y: number };
  color: string;
}

export interface NormalizedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data: Record<string, any>;
}

export interface CanvasControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
}
