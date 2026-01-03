import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useQueryExecution, useSession } from "@/hooks/useConnection";
import { useTables } from "@/hooks/useDatabaseInfo";
import type { QueryResult } from "../../shared/types";

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

  const { isConnected } = useSession();
  const { data: tablesData } = useTables(isConnected);

  // Prepare schema for autocompletion
  const editorSchema = useMemo(() => {
    const tables = tablesData?.tables || [];
    const schema: Record<string, string[]> = {};
    tables.forEach(table => {
      schema[table] = []; // We don't have columns yet, but table names are enough for now
    });
    return schema;
  }, [tablesData]);

  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    removeTab,
    updateTabContent,
    updateTabFileId,
    updateTabTitle,
  } = useQueryTabs();

  // Sync tab titles with file names when files are renamed
  // Only sync if the tab content matches the saved file (not dirty)
  useEffect(() => {
    if (!files) return;
    
    tabs.forEach(tab => {
      if (tab.fileId) {
        const file = files.find(f => f.id === tab.fileId);
        if (file && file.name !== tab.title) {
          // Check if tab is "clean" (content matches saved file)
          const isClean = file.content === tab.content;
          if (isClean) {
            updateTabTitle(tab.id, file.name);
          }
        }
      }
    });
  }, [files]);

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

  const queryExecution = useQueryExecution();
  const [tabResults, setTabResults] = useState<Record<string, { 
    result: QueryResult | null, 
    isSuccess: boolean, 
    error: string | null 
  }>>({});

  const currentTabResult = activeTabId ? tabResults[activeTabId] : null;

  const handleRun = useCallback(async (query?: string) => {
    const queryToRun = query || activeTab?.content;
    if (!queryToRun) return;
    
    // Clear error for this tab before running
    setTabResults(prev => ({
      ...prev,
      [activeTabId]: { ...(prev[activeTabId] || { result: null }), isSuccess: false, error: null }
    }));

    try {
      const result = await queryExecution.mutateAsync(queryToRun);
      setTabResults(prev => ({
        ...prev,
        [activeTabId]: { result, isSuccess: true, error: null }
      }));
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Query failed";
      setTabResults(prev => ({
        ...prev,
        [activeTabId]: { result: null, isSuccess: false, error: errorMsg }
      }));
    }
  }, [activeTabId, activeTab?.content, queryExecution]);

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
            schema={editorSchema}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={20}>
          <ResultsPanel
            result={currentTabResult?.result ?? null}
            isLoading={queryExecution.isPending}
            isSuccess={currentTabResult?.isSuccess ?? false}
            error={currentTabResult?.error ?? null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
