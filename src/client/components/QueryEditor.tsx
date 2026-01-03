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

import { useEffect, useRef, useCallback, useMemo } from "react";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: (query?: string) => void;
  onSave?: () => void;
  schema?: Record<string, string[]>;
}

const appTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--background) !important",
    color: "var(--foreground)",
    height: "100%",
  },
  ".cm-content": {
    caretColor: "var(--primary)",
    fontFamily: "var(--font-mono)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "2px solid var(--primary) !important",
  },
  "&.cm-focused": {
    outline: "none !important",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--accent) !important",
    opacity: "0.4",
  },
  ".cm-gutters": {
    backgroundColor: "var(--background) !important",
    color: "var(--muted-foreground)",
    border: "none",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.03) !important",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent !important",
    color: "var(--foreground)",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "#ddd",
  },
  ".cm-tooltip": {
    border: "1px solid var(--border)",
    backgroundColor: "var(--popover)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
  },
});

export function QueryEditor({
  value,
  onChange,
  onRun,
  onSave,
  schema,
}: QueryEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const sqlExtension = useMemo(() => {
    return sql({
      schema: schema || {},
      upperCaseKeywords: true,
    });
  }, [schema]);

  const handleRun = useCallback(() => {
    const view = editorRef.current?.view;
    if (!view) {
      onRun();
      return;
    }

    const { from, to } = view.state.selection.main;
    const selection = view.state.doc.sliceString(from, to);

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
          extensions={[sqlExtension, appTheme]}
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

      <div className="flex items-center justify-end px-4 py-2 border-t border-border bg-card">
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
