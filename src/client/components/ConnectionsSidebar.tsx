import { useState, useMemo } from "react";
import { 
  Search, 
  Settings2, 
  Trash2, 
  MoreVertical, 
  Database, 
  Activity, 
  Clock, 
  ArrowUpDown,
  Edit2
} from "lucide-react";
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  useSavedConnections, 
  useSession, 
  useActivateConnection, 
  useDeleteConnection 
} from "@/hooks/useConnection";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { ConnectionDefinition } from "@/api/connection";

interface ConnectionsSidebarProps {
  onEditConnection: (id: string, s: ConnectionDefinition) => void;
}

export function ConnectionsSidebar({ onEditConnection }: ConnectionsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "active">("active");

  const { data: connections = [], isLoading } = useSavedConnections();
  const { session: currentSession } = useSession();
  const activateConnection = useActivateConnection();
  const deleteConnection = useDeleteConnection();

  const filteredConnections = useMemo(() => {
    let result = connections.filter(s => 
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.connection?.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.connection?.database.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      result.sort((a, b) => 
        new Date(b.lastActiveAt || 0).getTime() - new Date(a.lastActiveAt || 0).getTime()
      );
    }

    return result;
  }, [connections, searchQuery, sortBy]);

  const handleActivate = (id: string) => {
    if (activeConnectionId === id) return;
    activateConnection.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this connection?")) {
      deleteConnection.mutate(id);
    }
  };

  const activeConnectionId = currentSession?.connected ? connections.find(s => s.connection?.host === currentSession.connection?.host)?.id : null;

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connections
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("active")}>
                Sort by Last Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Sort by Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search connections..." 
            className="pl-8 h-8 text-xs bg-muted/50 border-none h-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {isLoading ? (
               <div className="px-4 py-2 text-xs text-muted-foreground">Loading...</div>
            ) : filteredConnections.length === 0 ? (
               <div className="px-4 py-2 text-xs text-muted-foreground">No connections found</div>
            ) : (
              filteredConnections.map((s) => (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton
                    isActive={activeConnectionId === s.id}
                    className={cn(
                      "flex flex-col items-start gap-1 py-3 h-auto",
                      activeConnectionId === s.id && "bg-accent/50"
                    )}
                    onClick={() => s.id && handleActivate(s.id)}
                  >
                    <div className="flex items-center justify-between w-full pr-6">
                      <span className="font-medium truncate">{s.name || "Unnamed Server"}</span>
                      <Badge variant="outline" className={cn(
                        "text-[9px] uppercase tracking-wider px-1 py-0",
                        s.category === "production" ? "text-red-400 border-red-400/30 bg-red-400/5" : "text-blue-400 border-blue-400/30 bg-blue-400/5"
                      )}>
                        {s.category || "development"}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate w-full flex items-center gap-1.5 font-mono">
                      <span>{s.connection?.user}@{s.connection?.host}</span>
                      <span>•</span>
                      <span>{s.connection?.database}</span>
                    </div>
                    {s.lastActiveAt && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(s.lastActiveAt), { addSuffix: true })}
                      </div>
                    )}
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreVertical className="h-4 w-4" />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        className="gap-2"
                        onClick={() => s.id && onEditConnection(s.id, s)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit Connection
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive gap-2 focus:text-destructive"
                        onClick={(e) => s.id && handleDelete(s.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </div>
  );
}
