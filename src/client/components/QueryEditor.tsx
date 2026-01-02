import { Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";
import { dracula } from "@uiw/codemirror-theme-dracula";

import { useEffect } from "react";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: (query?: string) => void;
  onSave?: () => void;
}

const databases = [
  { id: "postgres", name: "postgres" },
  { id: "graph", name: "graph_db" },
];

const appThemeOverrides = EditorView.theme({
  "&": {
    backgroundColor: "transparent !important",
    height: "100%",
  },
  ".cm-gutters": {
    backgroundColor: "transparent !important",
    border: "none",
  },
  "&.cm-focused": {
    outline: "none !important",
  },
  // Ensure cursor is visible (Dracula sets it, but we confirm z-index/visibility)
  ".cm-cursor": {
    borderLeftWidth: "2px", // Make it slightly thicker "pipe"
  }
});

import { useRef, useCallback } from "react";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

export function QueryEditor({ value, onChange, onRun, onSave }: QueryEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const handleRun = useCallback(() => {
    const view = editorRef.current?.view;
    if (!view) {
      onRun();
      return;
    }

    const { from, to } = view.state.selection.main;
    const selection = view.state.doc.sliceString(from, to);
    
    // If something is selected, run only that. Otherwise run the whole content.
    if (selection && selection.trim().length > 0) {
      onRun(selection);
    } else {
      onRun();
    }
  }, [onRun]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, handleRun]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 relative overflow-hidden">
        <CodeMirror
          ref={editorRef}
          value={value}
          height="100%"
          theme={dracula}
          extensions={[sql(), appThemeOverrides]}
          onChange={onChange}
          className="h-full text-sm font-mono border-none"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            drawSelection: true,
          }}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-[oklch(0.12_0_0)]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Source</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs bg-transparent">
                Primary Database
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Primary Database</DropdownMenuItem>
              <DropdownMenuItem>Read Replica</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <span className="text-xs text-muted-foreground">Role</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs bg-transparent">
                postgres
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {databases.map((db) => (
                <DropdownMenuItem key={db.id}>{db.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
             {onSave && (
               <Button
                 onClick={onSave}
                 variant="secondary"
                 size="sm"
                 className="h-7 text-xs"
               >
                 Save
               </Button>
             )}
            <Button 
              onClick={handleRun} 
              size="sm" 
              className="h-7 gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20"
            >
              <span>Run</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-white/20 bg-white/10 px-1 font-mono text-[9px] font-medium">
                ⌘ ↵
              </kbd>
            </Button>
        </div>
      </div>
    </div>
  );
}
