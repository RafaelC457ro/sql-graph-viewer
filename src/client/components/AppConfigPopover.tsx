import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useGraphRenderer } from "@/hooks/useGraphRenderer";

export function AppConfigPopover() {
  const { renderer, setRenderer } = useGraphRenderer();

  const handleRendererChange = (value: string) => {
    const next = value === "cytoscape" ? "cytoscape" : "react-flow";
    setRenderer(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-white/40 hover:text-white"
          title="App Configuration"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" align="end" sideOffset={16}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Set the settings for the application.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="graph-renderer">Graph Renderer</Label>
              <Select value={renderer} onValueChange={handleRendererChange}>
                <SelectTrigger
                  id="graph-renderer"
                  className="col-span-2 h-8 justify-between text-xs"
                >
                  <SelectValue placeholder="Select renderer" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="react-flow">React Flow</SelectItem>
                  <SelectItem value="cytoscape">Cytoscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
