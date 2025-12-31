import { useState } from "react";
import {
  Database,
  FileText,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FilesSidebar } from "./FilesSidebar";
import { DatabaseSidebar } from "./DatabaseSidebar";
import { AppConfigPopover } from "./AppConfigPopover";
import { cn } from "@/lib/utils";

type ActiveView = "database" | "files";

export function AppSidebar() {
  const [activeView, setActiveView] = useState<ActiveView>("files");
  const { setOpen, open } = useSidebar();

  const handleViewChange = (view: ActiveView) => {
    if (activeView === view && open) {
       // Optional: toggle close if clicking same icon? 
       // For now, let's just keep it simple.
    } else {
      setActiveView(view);
      setOpen(true);
    }
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border bg-[oklch(0.12_0_0)] overflow-hidden"
    >
      <SidebarHeader className="h-12 border-b border-border px-4 py-0 flex justify-center sr-only">
        <Link to="/" className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <span>Query Editor</span>
        </Link>
      </SidebarHeader>

      <div className="flex h-full flex-1 overflow-hidden">
        {/* Rail (Activity Bar) */}
        <div className="w-[48px] border-r border-border flex flex-col items-center py-2 gap-2 bg-[oklch(0.12_0_0)] z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewChange("database")}
            className={cn(
              "h-10 w-10 text-muted-foreground hover:text-foreground",
              activeView === "database" && "bg-accent text-accent-foreground"
            )}
            title="Database Info"
          >
            <Database className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewChange("files")}
            className={cn(
              "h-10 w-10 text-muted-foreground hover:text-foreground",
              activeView === "files" && "bg-accent text-accent-foreground"
            )}
            title="Files"
          >
            <FileText className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <AppConfigPopover />
        </div>

        {/* Sidebar Content Panel */}
        <SidebarContent className="flex-1 gap-0">
          {activeView === "files" && <FilesSidebar />}
          {activeView === "database" && <DatabaseSidebar />}
        </SidebarContent>
      </div>


    </Sidebar>
  );
}
