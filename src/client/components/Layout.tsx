import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
import { 
  useSession, 
  useConnection, 
  useSavedConnections, 
  useActivateConnection 
} from "@/hooks/useConnection";
import { ConnectionDialog } from "./ConnectionDialog";
import type { ConnectionDefinition } from "@/api/connection";

interface LayoutProps {
  children: React.ReactNode;
}

interface ServerSelectorProps {
  onOpenNew: () => void;
  savedConnections: ConnectionDefinition[] | undefined;
  activate: any;
  targetConnectionId: string | null;
  setTargetConnectionId: (id: string | null) => void;
}

function ServerSelector({ onOpenNew, savedConnections, activate, targetConnectionId, setTargetConnectionId }: ServerSelectorProps) {
  const [open, setOpen] = useState(false);
  const { session } = useSession();

  const currentSelection = savedConnections?.find(s => s.id === targetConnectionId);
  const currentServer = session?.connected ? session.name : (currentSelection?.name || "Select Server");

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
              {savedConnections?.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.name?.toLowerCase()} ${s.connection?.host?.toLowerCase()} ${s.id}`}
                  onSelect={() => {
                    if (s.id) {
                      setTargetConnectionId(s.id);
                      setOpen(false);
                    }
                  }}
                  className="text-xs py-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  <div 
                    className="flex items-center w-full"
                    onClick={() => {
                      if (s.id) {
                        setTargetConnectionId(s.id);
                        setOpen(false);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3.5 w-3.5 text-[oklch(0.55_0.22_145)]",
                        (session?.connected ? session.id : targetConnectionId) === s.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="truncate font-medium">{s.name || "Unnamed Server"}</span>
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
  onEditConnection: (id: string, s: any) => void;
  targetConnectionId: string | null;
  setTargetConnectionId: (id: string | null) => void;
}

function Header({ onOpenConnection, onEditConnection, targetConnectionId, setTargetConnectionId }: HeaderProps) {
  const { state, toggleSidebar } = useSidebar();
  const { session } = useSession();
  const { disconnect } = useConnection();
  const { data: savedConnections } = useSavedConnections();
  const activate = useActivateConnection();
  const isCollapsed = state === "collapsed";

  const handleConnect = () => {
    if (targetConnectionId) {
      activate.mutate(targetConnectionId, {
        onError: () => {
          const s = savedConnections?.find(x => x.id === targetConnectionId);
          if (s) {
            onEditConnection(s.id, s);
          }
        }
      });
    } else {
      onOpenConnection();
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
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
        
        <ServerSelector 
          onOpenNew={onOpenConnection} 
          savedConnections={savedConnections}
          activate={activate}
          targetConnectionId={targetConnectionId}
          setTargetConnectionId={setTargetConnectionId}
        />

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
            onClick={handleConnect}
            disabled={activate.isPending}
          >
            {activate.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
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
  const [editConnection, setEditConnection] = useState<{ id: string; data: any } | null>(null);
  const [targetConnectionId, setTargetConnectionId] = useState<string | null>(null);
  const { session } = useSession();
  const { data: savedConnections } = useSavedConnections();

  useEffect(() => {
    if (session?.connected && session.id) {
      setTargetConnectionId(session.id);
    } else if (!targetConnectionId && savedConnections && savedConnections.length > 0) {
      const firstConnection = savedConnections[0];
      if (firstConnection?.id) {
        setTargetConnectionId(firstConnection.id);
      }
    }
  }, [session, savedConnections, targetConnectionId]);

  const handleOpenNew = () => {
    setEditConnection(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string, s: any) => {
    setEditConnection({ 
      id, 
      data: {
        host: s.connection.host,
        port: s.connection.port || "5432",
        database: s.connection.database,
        user: s.connection.user,
        password: "",
        graph: s.connection.graph,
        name: s.name,
        category: s.category
      }
    });
    setDialogOpen(true);
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar onEditConnection={handleEdit} />
      <SidebarInset className="flex flex-col h-screen bg-background min-w-0 overflow-hidden">
        <Header 
          onOpenConnection={handleOpenNew} 
          onEditConnection={handleEdit}
          targetConnectionId={targetConnectionId}
          setTargetConnectionId={setTargetConnectionId}
        />
        <div className="flex-1 min-h-0 overflow-hidden bg-background">
          {children}
        </div>
      </SidebarInset>
      <ConnectionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        initialData={editConnection?.data}
        connectionId={editConnection?.id}
      />
    </SidebarProvider>
  );
}
