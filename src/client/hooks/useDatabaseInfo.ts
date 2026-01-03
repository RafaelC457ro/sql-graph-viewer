import { useQuery } from "@tanstack/react-query";
import { getTables, getGraphs, getGraphItems } from "../api/database";

export const useTables = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["database", "tables"],
    queryFn: getTables,
    enabled,
  });
};

export const useGraphs = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["database", "graphs"],
    queryFn: getGraphs,
    enabled,
  });
};

export const useGraphItems = (graph: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["database", "graph-items", graph],
    queryFn: () => getGraphItems(graph),
    enabled: enabled && !!graph,
  });
};
