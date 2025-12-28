import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResultsTable } from "./ResultsTable";
import { GraphView } from "./GraphView";

interface ResultsPanelProps {
  columns: string[];
  rows: Record<string, unknown>[];
  graphNodes: { id: string; label: string }[];
  graphEdges: { source: string; target: string; label?: string }[];
}

export function ResultsPanel({
  columns,
  rows,
  graphNodes,
  graphEdges,
}: ResultsPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="results" className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
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
