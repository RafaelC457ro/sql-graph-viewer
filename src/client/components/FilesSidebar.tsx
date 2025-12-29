import { useState, useEffect } from "react";
import {
  Database,
  FolderOpen,
  Heart,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const sharedQueries = [
  { id: "1", name: "All Users", icon: FolderOpen },
];

const favoriteQueries = [
  { id: "1", name: "Recent Orders", icon: Heart },
];

const communityQueries = [
  { id: "1", name: "Templates", icon: FolderOpen },
  { id: "2", name: "Quickstarts", icon: FolderOpen },
];

type SectionKey = "shared" | "favorites" | "files" | "community";

export function FilesSidebar() {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>("files");
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/queries")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFiles(data);
      })
      .catch((err) => console.error("Failed to load queries", err));
  }, []);

  const toggleSection = (section: SectionKey) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <div className="flex h-12 shrink-0 items-center px-4 text-sm font-semibold border-b border-border">
        Files
      </div>
      
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

      {/* FILES Section */}
      <SidebarGroup>
        <button
          onClick={() => toggleSection("files")}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {expandedSection === "files" ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          FILES ({files.length})
        </button>
        {expandedSection === "files" && (
          <SidebarGroupContent className="ml-3 mt-1">
            <SidebarMenu>
              {files.map((filename) => (
                <SidebarMenuItem key={filename}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={`/?query=${filename}`} 
                      className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <Database className="h-3 w-3" />
                      <span>{filename}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                    <Plus className="h-3 w-3" />
                    <span>New File</span>
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
    </>
  );
}
