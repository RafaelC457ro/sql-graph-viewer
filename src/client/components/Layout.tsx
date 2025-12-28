import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

function Header() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-[oklch(0.12_0_0)] px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">AGE Viewer</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Query Editor</span>
          <span className="text-muted-foreground">/</span>
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            DEVELOPMENT
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 text-xs">
          Connect
        </Button>
      </div>
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen bg-[oklch(0.09_0_0)]">
        <Header />
        <main className="flex-1 overflow-hidden bg-[oklch(0.12_0_0)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
