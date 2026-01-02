import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  PanelLeftClose, 
  PanelLeft, 
  Plug, 
  Check, 
  ChevronsUpDown, 
  Plus, 
  Power,
  RefreshCw 
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSession, useConnection, useSessions, useActivateSession } from "@/hooks/useConnection";
import { ConnectionDialog } from "./ConnectionDialog";

interface LayoutProps {
  children: React.ReactNode;
}

interface ServerSelectorProps {
  onOpenNew: () => void;
}

function ServerSelector({ onOpenNew }: ServerSelectorProps) {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const { data: savedSessions } = useSessions();
  const activate = useActivateSession();

  const currentServer = session?.name || "Select Server";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-[200px] justify-between bg-transparent border-border hover:bg-accent text-xs px-2"
        >
          <div className="flex items-center gap-2 truncate">
            <div className={cn(
              "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
              session?.connected ? "bg-green-500 shadow-green-500/50" : "bg-muted-foreground"
            )} />
            <span className="truncate font-medium">{currentServer}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 shadow-2xl border-border" align="start">
        <Command className="bg-popover">
          <CommandInput placeholder="Search servers..." className="h-9 text-xs" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-xs text-center text-muted-foreground">No server found.</CommandEmpty>
            <CommandGroup heading={<span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 px-2">Saved Connections</span>}>
              {savedSessions?.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  onSelect={() => {
                    if (s.id) {
                      activate.mutate(s.id);
                      setOpen(false);
                    }
                  }}
                  className="text-xs py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 text-[oklch(0.55_0.22_145)]",
                      session?.name === s.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <span className="truncate font-medium">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[9px] px-1 rounded-[2px] font-bold uppercase",
                        s.category === "production" ? "bg-red-500/10 text-red-400" : "bg-[oklch(0.55_0.22_145)]/10 text-[oklch(0.55_0.22_145)]"
                      )}>
                        {s.category}
                      </span>
                      <span className="text-[9px] text-muted-foreground truncate">{s.connection?.host}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <Separator className="my-1 opacity-50" />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  onOpenNew();
                }}
                className="text-xs py-2.5 cursor-pointer text-blue-400 focus:bg-blue-400/10 focus:text-blue-400"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                New Connection
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface HeaderProps {
  onOpenConnection: () => void;
}

function Header({ onOpenConnection }: HeaderProps) {
  const { state, toggleSidebar } = useSidebar();
  const { session } = useSession();
  const { disconnect } = useConnection();
  const isCollapsed = state === "collapsed";

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-[oklch(0.12_0_0)] px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
        
        <Separator orientation="vertical" className="h-4" />
        
        <ServerSelector onOpenNew={onOpenConnection} />

        {session?.connected ? (
          <div className="flex items-center gap-2">
            {session.category && (
              <span className={cn(
                "rounded px-2 py-0.5 text-[10px] font-bold tracking-wider",
                session.category === "production" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : "bg-[oklch(0.55_0.22_145)]/20 text-[oklch(0.55_0.22_145)] border border-[oklch(0.55_0.22_145)]/30"
              )}>
                {session.category.toUpperCase()}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-full gap-1.5 px-3 bg-transparent border-border text-red-400 hover:text-red-400 hover:bg-red-400/10"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
            >
              {disconnect.isPending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs rounded-full gap-1.5 px-3 bg-transparent border-border hover:bg-accent hover:text-accent-foreground"
            onClick={onOpenConnection}
          >
            <Plug className="h-3.5 w-3.5" />
            Connect
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Right side actions if any */}
      </div>
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen bg-[oklch(0.09_0_0)] min-w-0 overflow-hidden">
        <Header onOpenConnection={() => setDialogOpen(true)} />
        <div className="flex-1 min-h-0 overflow-hidden bg-[oklch(0.12_0_0)]">
          {children}
        </div>
      </SidebarInset>
      <ConnectionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarProvider>
  );
}
