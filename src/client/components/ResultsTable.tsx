import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  isSuccess: boolean;
}

const DEFAULT_SIZE = 300;
const MIN_SIZE = 50;
const MAX_SIZE = 800;

export function ResultsTable({ columns, rows, isSuccess }: ResultsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableColumns = React.useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col,
        header: col,
        cell: ({ getValue }) => String(getValue() ?? ""),
        size: DEFAULT_SIZE,
        minSize: MIN_SIZE,
        maxSize: MAX_SIZE,
      })),
    [columns]
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Calculate column sizes as CSS variables once at table level
  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: Record<string, number> = {};
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  if (!isSuccess) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
        Click Run to execute your query.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
        Executed. No rows returned.
      </div>
    );
  }

  return (
    <ScrollArea className="w-full h-full border rounded-md">
      <div 
        className="relative"
        style={{
          ...columnSizeVars,
          width: table.getTotalSize(),
        }}
      >
        <table className="w-full caption-bottom text-xs border-l border-b table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className="relative select-none p-0"
                      style={{
                        width: `calc(var(--header-${header.id}-size) * 1px)`,
                      }}
                    >
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:text-foreground w-full h-full px-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="truncate flex-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {isSorted === "asc" ? (
                          <ArrowUp className="h-3 w-3 shrink-0" />
                        ) : isSorted === "desc" ? (
                          <ArrowDown className="h-3 w-3 shrink-0" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 shrink-0 opacity-30" />
                        )}
                      </div>
                      {/* Resize handle */}
                      <div
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                          "bg-border/50 transition-colors hover:bg-primary/50",
                          header.column.getIsResizing() && "bg-primary w-[2px] opacity-100"
                        )}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* Use memoized body during resize for performance */}
          {table.getState().columnSizingInfo.isResizingColumn ? (
            <MemoizedTableBody table={table} columns={columns} />
          ) : (
            <ResultsTableBody table={table} columns={columns} />
          )}
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}

// Table body component
function ResultsTableBody({
  table,
  columns,
}: {
  table: TanStackTable<Record<string, unknown>>;
  columns: string[];
}) {
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className="p-2 border-r last:border-r-0 border-border font-mono text-sm"
              style={{
                width: `calc(var(--col-${cell.column.id}-size) * 1px)`
              }}
            >
              <div className="truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// Memoized table body for performant resizing
const MemoizedTableBody = React.memo(
  ResultsTableBody,
  (prev, next) => prev.table.options.data === next.table.options.data
) as typeof ResultsTableBody;
