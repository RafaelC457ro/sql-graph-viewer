import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { QueryTabs } from "@/components/QueryTabs";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useQueryTabs } from "@/hooks/useQueryTabs";
import { useFiles, useUpdateFile, useCreateFile } from "@/hooks/useFiles";

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

// Helper to generate unique name with (1), (2), etc.
function getUniqueName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) return baseName;
  
  let counter = 1;
  let newName = `${baseName} (${counter})`;
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${baseName} (${counter})`;
  }
  return newName;
}

export function QueryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileIdParam = searchParams.get("fileId");
  const fileId = fileIdParam ? parseInt(fileIdParam) : undefined;
  
  const { data: files } = useFiles();
  const updateFile = useUpdateFile();
  const createFile = useCreateFile();

  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    removeTab,
    updateTabContent,
    updateTabFileId,
  } = useQueryTabs();

  // Load file from URL param into a tab
  useEffect(() => {
    if (fileId && files) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        // Check if tab for this file already exists using fileId
        const existingTab = tabs.find(t => t.fileId === fileId);
        
        if (existingTab) {
           if (existingTab.id !== activeTabId) {
             setActiveTabId(existingTab.id);
           }
        } else {
           addTab({ title: file.name, content: file.content, fileId: file.id });
        }
      }
    }
  }, [fileId, files]);
  
  const handleSave = async () => {
    if (!activeTab) return;
    
    if (activeTab.fileId) {
      // Update existing file
      try {
        await updateFile.mutateAsync({
          id: activeTab.fileId,
          name: activeTab.title,
          content: activeTab.content
        });
      } catch (e) {
        console.error(e);
        alert("Failed to save");
      }
    } else {
      // Create new file with unique name
      try {
        const existingNames = files?.map(f => f.name) || [];
        const uniqueName = getUniqueName(activeTab.title, existingNames);
        
        const newFile = await createFile.mutateAsync({
          name: uniqueName,
          content: activeTab.content,
        });
        
        // Associate tab with new file
        updateTabFileId(activeTabId, newFile.id);
        navigate(`/?fileId=${newFile.id}`);
      } catch (e) {
        console.error(e);
        alert("Failed to create file");
      }
    }
  };

  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    setHasRun(true);
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
            onSave={handleSave}
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
