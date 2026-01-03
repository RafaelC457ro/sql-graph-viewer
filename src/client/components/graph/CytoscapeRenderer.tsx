import { useCallback, useEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import type {
  CanvasControls,
  NormalizedEdge,
  NormalizedNode,
} from "./graph-types";

const cytoscapeAny = cytoscape as unknown as {
  __ageViewerColaRegistered?: boolean;
};

if (!cytoscapeAny.__ageViewerColaRegistered) {
  (cytoscape as any).use(cola);
  cytoscapeAny.__ageViewerColaRegistered = true;
}

type CytoscapeCore = cytoscape.Core;
type CytoscapeSelectable = cytoscape.NodeSingular | cytoscape.EdgeSingular;
type CytoscapeElementDefinition = cytoscape.ElementDefinition;
type CytoscapeEvent = cytoscape.EventObject;
type CytoscapeNodeEvent = cytoscape.EventObjectNode;
type CytoscapeEdgeEvent = cytoscape.EventObjectEdge;

type CytoscapeRendererProps = {
  nodes: NormalizedNode[];
  edges: NormalizedEdge[];
  physicsEnabled: boolean;
  onSelect: (data: Record<string, any> | null) => void;
  registerControls: (controls: CanvasControls | null) => void;
};

export function CytoscapeRenderer({
  nodes,
  edges,
  physicsEnabled,
  onSelect,
  registerControls,
}: CytoscapeRendererProps) {
  const cyRef = useRef<CytoscapeCore | null>(null);
  const lastSelectedRef = useRef<CytoscapeSelectable | null>(null);

  const clearSelection = useCallback(() => {
    if (lastSelectedRef.current) {
      lastSelectedRef.current.removeClass("selected");
      lastSelectedRef.current = null;
    }
    onSelect(null);
  }, [onSelect]);

  const elements = useMemo<CytoscapeElementDefinition[]>(() => {
    const nodeElements = nodes.map((node) => ({
      data: {
        id: node.id,
        label: typeof node.data.label === "string" ? node.data.label : node.id,
        vertexLabel: node.data.vertexLabel,
        color: node.color,
        payload: node.data,
      },
      position: node.position,
      classes: "graph-node",
    }));

    const edgeElements = edges.map((edge) => {
      const base = edge.data ?? {};
      const edgeLabel =
        typeof base.edgeLabel === "string" ? base.edgeLabel : edge.label;
      const payload = edgeLabel ? { ...base, edgeLabel } : base;
      return {
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edgeLabel ?? "",
          payload,
        },
        classes: "graph-edge",
      } as CytoscapeElementDefinition;
    });

    return [...nodeElements, ...edgeElements];
  }, [nodes, edges]);

  const stylesheet = useMemo(
    () => [
      {
        selector: "node",
        style: {
          width: 80,
          height: 80,
          "background-color": "data(color)",
          label: "data(label)",
          color: "#ffffff",
          "font-size": 8,
          "text-valign": "center",
          "text-halign": "center",
          "text-wrap": "wrap",
          "text-max-width": 68,
          "border-width": 2,
          "border-color": "rgba(255,255,255,0.15)",
          "overlay-padding": 8,
          "overlay-opacity": 0,
          "shadow-color": "rgba(0,0,0,0.3)",
          "shadow-blur": 12,
          "shadow-offset-x": 0,
          "shadow-offset-y": 4,
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#999999",
          "target-arrow-color": "#999999",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)",
          "font-size": 8,
          "text-background-color": "rgba(26,26,26,0.85)",
          "text-background-shape": "roundrectangle",
          "text-background-padding": 4,
          "text-background-opacity": 1,
          "text-rotation": "autorotate",
          color: "#fefefe",
        },
      },
      {
        selector: ".selected",
        style: {
          "border-color": "#ffffff",
          "border-width": 4,
          "shadow-color": "rgba(255,255,255,0.4)",
          "shadow-blur": 18,
        },
      },
    ],
    []
  );

  useEffect(() => () => registerControls(null), [registerControls]);

  const applySelection = useCallback((element: CytoscapeSelectable) => {
    if (lastSelectedRef.current && lastSelectedRef.current !== element) {
      lastSelectedRef.current.removeClass("selected");
    }
    element.addClass("selected");
    lastSelectedRef.current = element;
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleNodeTap = (event: CytoscapeNodeEvent) => {
      const target = event.target;
      applySelection(target);
      const payload = target.data("payload") as Record<string, any> | undefined;
      const data = payload ?? {};
      onSelect(Object.keys(data).length > 0 ? data : null);
    };

    const handleEdgeTap = (event: CytoscapeEdgeEvent) => {
      const target = event.target;
      applySelection(target);
      const payload = target.data("payload") as Record<string, any> | undefined;
      const base = payload ?? {};
      const edgeLabel = target.data("label");
      const merged =
        typeof edgeLabel === "string" && edgeLabel.length > 0
          ? { edgeLabel, ...base }
          : base;
      onSelect(Object.keys(merged).length > 0 ? merged : null);
    };

    const handleTap = (event: CytoscapeEvent) => {
      if (event.target === cy) {
        clearSelection();
      }
    };

    cy.on("tap", "node", handleNodeTap);
    cy.on("tap", "edge", handleEdgeTap);
    cy.on("tap", handleTap);

    return () => {
      cy.off("tap", "node", handleNodeTap);
      cy.off("tap", "edge", handleEdgeTap);
      cy.off("tap", handleTap);
    };
  }, [applySelection, clearSelection, onSelect]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.startBatch();
    cy.elements().remove();
    cy.add(elements);
    cy.endBatch();

    const layoutOptions = physicsEnabled
      ? {
          name: "cola",
          animate: true,
          maxSimulationTime: 4000,
          refresh: 16,
          fit: true,
          nodeSpacing: 12,
          edgeLength: 180,
          randomize: false,
        }
      : { name: "preset" };

    cy.layout(layoutOptions as cytoscape.LayoutOptions).run();
    cy.fit(undefined, 60);
    clearSelection();
  }, [elements, clearSelection, physicsEnabled]);

  const handleCy = useCallback(
    (cy: CytoscapeCore) => {
      cyRef.current = cy;
      registerControls({
        zoomIn: () => {
          const current = cy.zoom();
          cy.zoom(current * 1.2);
        },
        zoomOut: () => {
          const current = cy.zoom();
          cy.zoom(current / 1.2);
        },
        fitView: () => {
          cy.fit(undefined, 60);
        },
      });

      cy.resize();
      cy.fit(undefined, 60);
    },
    [registerControls]
  );

  useEffect(() => {
    const handle = () => {
      cyRef.current?.resize();
      cyRef.current?.fit(undefined, 60);
    };
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("resize", handle);
    };
  }, []);

  return (
    <CytoscapeComponent
      cy={handleCy}
      elements={elements}
      stylesheet={stylesheet as any}
      style={{ width: "100%", height: "100%" }}
      layout={{ name: "preset" }}
    />
  );
}
