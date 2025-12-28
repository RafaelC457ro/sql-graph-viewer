import { useState } from "react";

export interface QueryTab {
  id: string;
  title: string;
  content: string;
}

export function useQueryTabs() {
  const [tabs, setTabs] = useState<QueryTab[]>([
    { id: "1", title: "Query 1", content: "-- Write your SQL query here\nSELECT * FROM " },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");

  const addTab = () => {
    const newId = String(Date.now());
    const newTab: QueryTab = {
      id: newId,
      title: `Query ${tabs.length + 1}`,
      content: "-- Write your SQL query here\n",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const removeTab = (id: string) => {
    if (tabs.length === 1) return; // Keep at least one tab
    
    const newTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    
    // If we closed the active tab, switch to the last tab
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1]?.id ?? "");
    }
  };

  const updateTabContent = (id: string, content: string) => {
    setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, content } : tab)));
  };

  const updateTabTitle = (id: string, title: string) => {
    setTabs(tabs.map((tab) => (tab.id === id ? { ...tab, title } : tab)));
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    removeTab,
    updateTabContent,
    updateTabTitle,
  };
}
