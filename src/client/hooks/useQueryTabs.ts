import { useCallback, useEffect, useMemo, useState } from "react";

export interface QueryTab {
  id: string;
  title: string;
  content: string;
  fileId?: number;
  lastSyncedAt?: string;
}

interface PersistedTabState {
  tabs: QueryTab[];
  activeTabId: string;
}

const STORAGE_KEY = "age-viewer.query-tabs";

const createTabId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createDefaultState = (): PersistedTabState => {
  const defaultTabId = createTabId();
  return {
    tabs: [
      {
        id: defaultTabId,
        title: "Query 1",
        content: "-- Write your SQL query here\nSELECT * FROM ",
      },
    ],
    activeTabId: defaultTabId,
  };
};

const isValidTab = (value: unknown): value is QueryTab => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<QueryTab>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.content === "string" &&
    (candidate.fileId === undefined || typeof candidate.fileId === "number")
  );
};

const loadInitialState = (): PersistedTabState => {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<PersistedTabState>;
    const tabs = Array.isArray(parsed.tabs)
      ? parsed.tabs.filter(isValidTab)
      : [];
    if (tabs.length === 0) {
      return createDefaultState();
    }

    const persistedActiveId =
      typeof parsed.activeTabId === "string" ? parsed.activeTabId : "";
    const [firstTab] = tabs;
    if (!firstTab) {
      return createDefaultState();
    }
    const fallbackActiveId = tabs.some((tab) => tab.id === persistedActiveId)
      ? persistedActiveId
      : firstTab.id;

    return {
      tabs,
      activeTabId: fallbackActiveId,
    };
  } catch (error) {
    console.warn("Failed to load query tabs state", error);
    return createDefaultState();
  }
};

export function useQueryTabs() {
  const initialState = useMemo(() => loadInitialState(), []);
  const [tabs, setTabs] = useState<QueryTab[]>(initialState.tabs);
  const [activeTabId, setActiveTabIdState] = useState<string>(
    initialState.activeTabId
  );

  const activeTab =
    tabs.find((tab) => tab.id === activeTabId) ?? tabs[tabs.length - 1];

  const setActiveTabId = useCallback((id: string) => {
    setActiveTabIdState(id);
  }, []);

  const addTab = useCallback(
    (initialData?: { title?: string; content?: string; fileId?: number; lastSyncedAt?: string }) => {
      const newId = createTabId();
      setTabs((currentTabs) => {
        const newTab: QueryTab = {
          id: newId,
          title: initialData?.title ?? `Query ${currentTabs.length + 1}`,
          content: initialData?.content ?? "-- Write your SQL query here\n",
          fileId: initialData?.fileId,
          lastSyncedAt: initialData?.lastSyncedAt,
        };
        return [...currentTabs, newTab];
      });
      setActiveTabIdState(newId);
    },
    []
  );

  const removeTab = useCallback((id: string) => {
    setTabs((currentTabs) => {
      if (currentTabs.length === 1) {
        return currentTabs;
      }

      const newTabs = currentTabs.filter((tab) => tab.id !== id);
      if (newTabs.length === currentTabs.length) {
        return currentTabs;
      }

      setActiveTabIdState((currentActiveId) => {
        if (currentActiveId !== id) {
          return currentActiveId;
        }
        const fallback = newTabs[newTabs.length - 1] ?? newTabs[0];
        return fallback ? fallback.id : currentActiveId;
      });

      return newTabs.length > 0 ? newTabs : currentTabs;
    });
  }, []);

  const updateTabContent = useCallback((id: string, content: string) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === id ? { ...tab, content } : tab))
    );
  }, []);

  const updateTabTitle = useCallback((id: string, title: string) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === id ? { ...tab, title } : tab))
    );
  }, []);

  const updateTabFileId = useCallback((id: string, fileId: number) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === id ? { ...tab, fileId } : tab))
    );
  }, []);

  const updateTabSyncedAt = useCallback((id: string, lastSyncedAt: string) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => (tab.id === id ? { ...tab, lastSyncedAt } : tab))
    );
  }, []);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId) && tabs.length > 0) {
      const lastTab = tabs[tabs.length - 1];
      if (lastTab) {
        setActiveTabIdState(lastTab.id);
      }
    }
  }, [tabs, activeTabId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const payload: PersistedTabState = {
        tabs,
        activeTabId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to persist query tabs state", error);
    }
  }, [tabs, activeTabId]);

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    removeTab,
    updateTabContent,
    updateTabTitle,
    updateTabFileId,
    updateTabSyncedAt,
  };
}
