import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ResultsTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  isSuccess: boolean;
}

export function ResultsTable({ columns, rows, isSuccess }: ResultsTableProps) {
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
    <ScrollArea className="h-full w-full">
      <Table className="border-t-0 min-w-full">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column} className="text-xs font-medium">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="border-border">
              {columns.map((column) => (
                <TableCell key={column} className="text-sm font-mono">
                  {String(row[column] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
