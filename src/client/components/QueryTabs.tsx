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
    <div className="flex h-9 items-center border-b border-border bg-muted/30">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group flex h-9 items-center gap-2 px-3 border-r border-border cursor-pointer transition-all text-xs relative",
                activeTabId === tab.id
                  ? "bg-card text-foreground border-t-2 border-t-white/80"
                  : "text-muted-foreground hover:bg-card hover:text-foreground border-t-2 border-t-transparent"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="text-sm truncate max-w-[120px] transition-all">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/10 p-0.5 rounded transition-all mr-[-4px]"
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
