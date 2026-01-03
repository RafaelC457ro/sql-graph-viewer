import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Circle, ArrowRight, Table, Search, SortAsc, Hash, Database, Share2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTables, useGraphs, useGraphItems } from "@/hooks/useDatabaseInfo";
import { useSession } from "@/hooks/useConnection";
import type { DatabaseItem } from "@/api/database";

interface SidebarControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortMode: "alpha" | "count";
  setSortMode: (mode: "alpha" | "count") => void;
  showCountSort?: boolean;
}

function SidebarControls({
  searchQuery,
  setSearchQuery,
  sortMode,
  setSortMode,
  showCountSort = true,
}: SidebarControlsProps) {
  return (
    <div className="px-4 py-2 space-y-2 border-b border-border bg-sidebar-header/50">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-7 h-8 text-xs bg-background/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-between">
         <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
           Filters
         </span>
         <button
            onClick={() => setSortMode(sortMode === "alpha" ? "count" : "alpha")}
            className="p-1 hover:bg-accent rounded-md transition-colors"
            title={sortMode === "alpha" ? "Sort by Count" : "Sort Alphabetically"}
          >
            {sortMode === "alpha" ? (
              <div className="flex items-center gap-1 text-[10px]">
                <SortAsc className="h-3 w-3" />
                <span>A-Z</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px]">
                <Hash className="h-3 w-3" />
                <span>Count</span>
              </div>
            )}
          </button>
      </div>
    </div>
  );
}

export function DatabaseSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"alpha" | "count">("alpha");
  const [activeTab, setActiveTab] = useState("relational");
  const [selectedGraph, setSelectedGraph] = useState<string>("");

  const { isConnected } = useSession();
  const { data: graphsData } = useGraphs(isConnected);
  const { data: tablesData, isLoading: isLoadingTables } = useTables(isConnected);
  const { data: graphItemsData } = useGraphItems(selectedGraph, isConnected);

  const graphs = graphsData?.graphs || [];
  const tables = tablesData?.tables || [];
  const nodes = graphItemsData?.nodes || [];
  const edges = graphItemsData?.edges || [];

  useEffect(() => {
    if (graphs.length > 0 && !selectedGraph) {
      setSelectedGraph(graphs[0] ?? "");
      setActiveTab("graph");
    }
  }, [graphs, selectedGraph]);

  const filterAndSort = <T extends DatabaseItem | string>(
    items: T[],
    isString = false
  ) => {
    const filtered = items.filter((item) => {
      const name = typeof item === "string" ? item : item.name;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const nameA = typeof a === "string" ? a : a.name;
      const nameB = typeof b === "string" ? b : b.name;
      const countA = typeof a === "string" ? 0 : a.count || 0;
      const countB = typeof b === "string" ? 0 : b.count || 0;

      if (sortMode === "count" && !isString) {
        if (countA !== countB) return countB - countA;
      }
      return nameA.localeCompare(nameB);
    });
  };

  const filteredTables = useMemo(() => filterAndSort(tables, true), [tables, searchQuery, sortMode]);
  const filteredNodes = useMemo(() => filterAndSort(nodes), [nodes, searchQuery, sortMode]);
  const filteredEdges = useMemo(() => filterAndSort(edges), [edges, searchQuery, sortMode]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-12 shrink-0 items-center px-4 text-sm font-semibold border-b border-border bg-sidebar-header">
        Database Discovery
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-sidebar-header/30">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="relational" className="text-xs flex items-center gap-2">
              <Database className="h-3 w-3" />
              Relational
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-xs flex items-center gap-2">
              <Share2 className="h-3 w-3" />
              Graph
            </TabsTrigger>
          </TabsList>
        </div>

        <SidebarControls 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          sortMode={sortMode}
          setSortMode={setSortMode}
          showCountSort={activeTab === "graph"}
        />

        <div className="flex-1 overflow-auto">
          <TabsContent value="relational" className="m-0 focus-visible:outline-none">
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Table className="h-3 w-3" />
                <span>Tables ({filteredTables.length})</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredTables.map((table) => (
                    <SidebarMenuItem key={table as string}>
                      <SidebarMenuButton>
                        <div className="flex items-center gap-2">
                          <Table className="h-3 w-3 opacity-50" />
                          <span className="truncate">{table as string}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {filteredTables.length === 0 && !isLoadingTables && (
                    <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                      No tables found
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>

          <TabsContent value="graph" className="m-0 focus-visible:outline-none">
            {graphs.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <Select value={selectedGraph} onValueChange={setSelectedGraph}>
                  <SelectTrigger className="h-8 text-xs bg-background/50">
                    <SelectValue placeholder="Select Graph" />
                  </SelectTrigger>
                  <SelectContent>
                    {graphs.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Circle className="h-3 w-3" />
                <span>Node Labels ({filteredNodes.length})</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNodes.map((node) => (
                    <SidebarMenuItem key={node.name}>
                      <SidebarMenuButton className="justify-between">
                        <div className="flex items-center gap-2">
                          <Circle className="h-2 w-2 fill-current" />
                          <span className="truncate">{node.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{node.count}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {filteredNodes.length === 0 && (
                    <div className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                      No nodes
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                <span>Edge Types ({filteredEdges.length})</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredEdges.map((edge) => (
                    <SidebarMenuItem key={edge.name}>
                      <SidebarMenuButton className="justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3" />
                          <span className="truncate">{edge.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{edge.count}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {filteredEdges.length === 0 && (
                    <div className="px-4 py-4 text-center text-xs text-muted-foreground italic">
                      No edges
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
