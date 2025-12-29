import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Circle, ArrowRight } from "lucide-react";

const nodeLabels = [
  { name: "Person", count: 15 },
  { name: "Movie", count: 8 },
  { name: "Genre", count: 4 },
];

const edgeTypes = [
  { name: "ACTED_IN", count: 22 },
  { name: "DIRECTED", count: 3 },
  { name: "PRODUCED", count: 5 },
];

export function DatabaseSidebar() {
  return (
    <>
      <div className="flex h-12 shrink-0 items-center px-4 text-sm font-semibold border-b border-border">
        Database Info
      </div>
      
      <SidebarGroup>
        <SidebarGroupLabel>Node Labels</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {nodeLabels.map((label) => (
              <SidebarMenuItem key={label.name}>
                <SidebarMenuButton className="justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="h-2 w-2 fill-current" />
                    <span>{label.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{label.count}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Edge Types</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {edgeTypes.map((type) => (
              <SidebarMenuItem key={type.name}>
                <SidebarMenuButton className="justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>{type.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{type.count}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
