import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { QueryTabs } from "@/components/QueryTabs";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useQueryTabs } from "@/hooks/useQueryTabs";

// Mock data for demonstration
const mockResults = {
  columns: ["id", "name", "color_source", "hex_value"],
  rows: [
    { id: 1, name: "Coral", color_source: "CRAYOLA", hex_value: "#FF7F50" },
    { id: 2, name: "Azure", color_source: "COLORHEXA", hex_value: "#007FFF" },
    { id: 3, name: "Emerald", color_source: "PANTONE", hex_value: "#50C878" },
  ],
};

const mockGraphData = {
  nodes: [
    { id: "1", label: "Person" },
    { id: "2", label: "Company" },
    { id: "3", label: "Product" },
    { id: "4", label: "City" },
  ],
  edges: [
    { source: "1", target: "2", label: "WORKS_AT" },
    { source: "2", target: "3", label: "PRODUCES" },
    { source: "1", target: "4", label: "LIVES_IN" },
  ],
};

export function QueryPage() {
  const [searchParams] = useSearchParams();
  const queryFile = searchParams.get("query");
  
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    removeTab,
    updateTabContent,
  } = useQueryTabs();

  // Handle opening file from URL param
  useEffect(() => {
    if (queryFile) {
      // Check if tab already exists to avoid refetching/duplicating if strictly based on name
      const existingTab = tabs.find(t => t.title === queryFile);
      if (existingTab) {
        setActiveTabId(existingTab.id);
      } else {
        fetch(`/api/query?file=${queryFile}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to load');
          })
          .then(data => {
             addTab({ title: data.filename, content: data.content });
          })
          .catch(err => console.error(err));
      }
    }
  }, [queryFile]);

  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    setHasRun(true);
    // In real implementation, this would execute the query
    console.log("Running query:", activeTab?.content);
  };

  return (
    <div className="h-full flex flex-col">
      <QueryTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onTabClose={removeTab}
        onTabAdd={addTab}
      />

      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={20}>
          <QueryEditor
            value={activeTab?.content ?? ""}
            onChange={(value) => updateTabContent(activeTabId, value)}
            onRun={handleRun}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={20}>
          <ResultsPanel
            columns={hasRun ? mockResults.columns : []}
            rows={hasRun ? mockResults.rows : []}
            graphNodes={hasRun ? mockGraphData.nodes : []}
            graphEdges={hasRun ? mockGraphData.edges : []}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
