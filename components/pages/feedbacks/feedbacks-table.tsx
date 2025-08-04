import * as React from "react";
import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { IconLoader } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrichedFeedback, FeedbacksTableProps } from "./types";

export function FeedbacksTable({ data, isLoading }: FeedbacksTableProps) {
  const columns = useMemo((): ColumnDef<EnrichedFeedback>[] => [
    {
      accessorKey: "messageContent",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue("messageContent")}>
          {row.getValue("messageContent")}
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => <div>{row.getValue("userName")}</div>,
    },
    {
      accessorKey: "agentName",
      header: "Agent",
      cell: ({ row }) => <div>{row.getValue("agentName")}</div>,
    },
    {
      accessorKey: "conversationTitle",
      header: "Conversation",
      cell: ({ row }) => (
        <div
          className="max-w-xs truncate"
          title={row.getValue("conversationTitle")}
        >
          {row.getValue("conversationTitle")}
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number | null;
        if (rating === null) {
          return <Badge variant="secondary">No Rating</Badge>;
        }
        return (
          <Badge variant={rating === 0 ? "default" : "outline"}>
            {rating === 1 ? "Like" : "Dislike"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => (
        <div
          className="whitespace-pre-wrap max-w-sm"
          title={row.getValue("comment") ?? undefined}
        >
          {row.getValue("comment") || (
            <span className="text-muted-foreground">No comment</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const feedback = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(feedback.id)}
              >
                Copy Feedback ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(feedback.messageId)}
              >
                Copy Message ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <IconLoader className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    Loading Feedbacks...
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 