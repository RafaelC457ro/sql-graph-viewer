import { useState } from "react";
import {
  Database,
  FolderOpen,
  Heart,
  Lock,
  Plus,
  Search,
  Clock,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const sharedQueries = [
  { id: "1", name: "All Users", icon: FolderOpen },
];

const favoriteQueries = [
  { id: "1", name: "Recent Orders", icon: Heart },
];

const privateQueries = [
  { id: "1", name: "Colors", icon: Database },
  { id: "2", name: "OpenAI Vector Search", icon: Database },
];

const communityQueries = [
  { id: "1", name: "Templates", icon: FolderOpen },
  { id: "2", name: "Quickstarts", icon: FolderOpen },
];

type SectionKey = "shared" | "favorites" | "private" | "community";

export function AppSidebar() {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>("private");

  const toggleSection = (section: SectionKey) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Sidebar className="border-r border-border bg-[oklch(0.12_0_0)]">
      <SidebarHeader className="h-12 border-b border-border px-4 py-0 flex justify-center">
        <Link to="/" className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <span>Query Editor</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* SHARED Section */}
        <SidebarGroup>
          <button
            onClick={() => toggleSection("shared")}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {expandedSection === "shared" ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            SHARED
          </button>
          {expandedSection === "shared" && (
            <SidebarGroupContent className="ml-3 mt-1">
              <SidebarMenu>
                {sharedQueries.map((query) => (
                  <SidebarMenuItem key={query.id}>
                    <SidebarMenuButton asChild>
                      <button className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground">
                        <query.icon className="h-3 w-3" />
                        <span>{query.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* FAVORITES Section */}
        <SidebarGroup>
          <button
            onClick={() => toggleSection("favorites")}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {expandedSection === "favorites" ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            FAVORITES
          </button>
          {expandedSection === "favorites" && (
            <SidebarGroupContent className="ml-3 mt-1">
              <SidebarMenu>
                {favoriteQueries.map((query) => (
                  <SidebarMenuItem key={query.id}>
                    <SidebarMenuButton asChild>
                      <button className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground">
                        <query.icon className="h-3 w-3" />
                        <span>{query.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* PRIVATE Section */}
        <SidebarGroup>
          <button
            onClick={() => toggleSection("private")}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {expandedSection === "private" ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            PRIVATE ({privateQueries.length})
          </button>
          {expandedSection === "private" && (
            <SidebarGroupContent className="ml-3 mt-1">
              <SidebarMenu>
                {privateQueries.map((query) => (
                  <SidebarMenuItem key={query.id}>
                    <SidebarMenuButton asChild>
                      <button className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Lock className="h-3 w-3" />
                        <span>{query.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                      <Plus className="h-3 w-3" />
                      <span>Add view</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* COMMUNITY Section */}
        <SidebarGroup>
          <button
            onClick={() => toggleSection("community")}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {expandedSection === "community" ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            COMMUNITY
          </button>
          {expandedSection === "community" && (
            <SidebarGroupContent className="ml-3 mt-1">
              <SidebarMenu>
                {communityQueries.map((query) => (
                  <SidebarMenuItem key={query.id}>
                    <SidebarMenuButton asChild>
                      <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground">
                        <query.icon className="h-3 w-3" />
                        <span>{query.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
          <Clock className="mr-2 h-3 w-3" />
          View running queries
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
