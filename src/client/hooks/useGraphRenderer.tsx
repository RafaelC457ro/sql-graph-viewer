import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type GraphRenderer = "react-flow" | "cytoscape";

interface GraphRendererContextValue {
  renderer: GraphRenderer;
  setRenderer: (renderer: GraphRenderer) => void;
}

const STORAGE_KEY = "age-viewer.graph-renderer";

const GraphRendererContext = createContext<GraphRendererContextValue | undefined>(undefined);

const resolveInitialRenderer = (): GraphRenderer => {
  if (typeof window === "undefined") {
    return "react-flow";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "cytoscape" || stored === "react-flow") {
    return stored;
  }

  return "react-flow";
};

export function GraphRendererProvider({ children }: { children: ReactNode }) {
  const [renderer, setRendererState] = useState<GraphRenderer>(() => resolveInitialRenderer());

  const setRenderer = useCallback((value: GraphRenderer) => {
    setRendererState((current) => {
      if (current === value) {
        return current;
      }

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, value);
        } catch (error) {
          console.warn("Failed to persist graph renderer option", error);
        }
      }

      return value;
    });
  }, []);

  const value = useMemo<GraphRendererContextValue>(
    () => ({ renderer, setRenderer }),
    [renderer, setRenderer]
  );

  return (
    <GraphRendererContext.Provider value={value}>{children}</GraphRendererContext.Provider>
  );
}

export function useGraphRenderer() {
  const context = useContext(GraphRendererContext);
  if (!context) {
    throw new Error("useGraphRenderer must be used within a GraphRendererProvider");
  }
  return context;
}

export type { GraphRenderer };
