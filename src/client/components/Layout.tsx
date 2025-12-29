import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft, Plug } from "lucide-react";
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
          <span className="text-muted-foreground">Server name</span>
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
            DEVELOPMENT
          </span>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs rounded-full gap-1.5 px-3 bg-transparent border-border hover:bg-accent hover:text-accent-foreground">
          <Plug className="h-3.5 w-3.5" />
          Connect
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {/* Right side actions if any */}
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
