import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTable } from "./ResultsTable";
import { GraphView } from "./GraphView";
import type { Node, Edge } from "reactflow";

interface ResultsPanelProps {
  columns: string[];
  rows: Record<string, unknown>[];
  graphNodes: Node[];
  graphEdges: Edge[];
  isLoading?: boolean;
  error?: string | null;
}

export function ResultsPanel({
  columns,
  rows,
  graphNodes,
  graphEdges,
  isLoading,
  error,
}: ResultsPanelProps) {
  return (
    <div className="h-full flex flex-col relative">
      {error && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 text-xl font-bold">!</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Query Error</h3>
            <p className="text-xs text-muted-foreground font-mono break-all">{error}</p>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[oklch(0.55_0.22_145)]"></div>
            <span className="text-xs text-muted-foreground">Running query...</span>
          </div>
        </div>
      )}
      <Tabs defaultValue="results" className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 py-0">
          <TabsList className="bg-transparent h-8 p-0 gap-4">
            <TabsTrigger
              value="results"
              className="text-xs h-8 px-2 rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:!border-b-[oklch(0.55_0.22_145)] data-[state=active]:text-foreground"
            >
              Results
            </TabsTrigger>

            <TabsTrigger
              value="graph"
              className="text-xs h-8 px-2 rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:!border-b-2 data-[state=active]:!border-b-[oklch(0.55_0.22_145)] data-[state=active]:text-foreground"
            >
              Graph
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="results" className="flex-1 m-0">
          <ResultsTable columns={columns} rows={rows} />
        </TabsContent>



        <TabsContent value="graph" className="flex-1 m-0">
          <GraphView nodes={graphNodes} edges={graphEdges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
