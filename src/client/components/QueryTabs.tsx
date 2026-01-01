import { Plus, X } from "lucide-react";
import type { QueryTab } from "@/hooks/useQueryTabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface QueryTabsProps {
  tabs: QueryTab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabAdd: () => void;
}

export function QueryTabs({
  tabs,
  activeTabId,
  onTabChange,
  onTabClose,
  onTabAdd,
}: QueryTabsProps) {
  return (
    <div className="flex h-9 items-center border-b border-border bg-[oklch(0.14_0_0)]">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group flex h-9 items-center gap-2 px-4 border-r border-border cursor-pointer transition-colors text-xs",
                activeTabId === tab.id
                  ? "bg-[oklch(0.12_0_0)] text-foreground"
                  : "text-muted-foreground hover:bg-[oklch(0.12_0_0)] hover:text-foreground"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="text-sm truncate max-w-[120px]">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onTabAdd}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
