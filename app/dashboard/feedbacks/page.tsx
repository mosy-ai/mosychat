"use client";

// --- 1. IMPORTS ---
import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { IconLoader } from "@tabler/icons-react";

// API client and types
import { apiClient } from "@/lib/api-client";
import type {
  FeedbackResponse,
  ListFeedbackParams,
} from "@/lib/api-client/types/conversation.types";
import type { UserResponse } from "@/lib/api-client/types/user.types";
import type { AgentResponse } from "@/lib/api-client/types/agent.types";
import type { ConversationResponse } from "@/lib/api-client/types/conversation.types";

// Shadcn/ui Components
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// --- 2. TYPE DEFINITIONS ---
// A custom "enriched" type that includes all the data we want to display in the table.
type EnrichedFeedback = {
  id: string;
  messageId: string;
  comment: string | null;
  rating: number | null;
  messageContent: string;
  userName: string;
  agentName: string;
  conversationTitle: string;
};

// Type for storing options for our filter dropdowns.
type FilterOptions = {
  users: UserResponse[];
  agents: AgentResponse[];
  conversations: ConversationResponse[];
};

// --- 3. COLUMN DEFINITIONS ---
// Memoize columns to prevent re-creation on every render.
const getColumns = (): ColumnDef<EnrichedFeedback>[] => [
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
        title={row.getValue("comment")}
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
];

// --- 4. MAIN PAGE COMPONENT ---
export default function FeedbackPage() {
  // State for the data table
  const [data, setData] = useState<EnrichedFeedback[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // State for pagination, controlled by the table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // tanstack-table is 0-indexed
    pageSize: 15,
  });

  // State for filter dropdowns
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    users: [],
    agents: [],
    conversations: [],
  });

  // State for the currently selected filter values
  const [filters, setFilters] = useState({
    user_id: "all",
    agent_id: "all",
    conversation_id: "all",
    rating: "all",
  });

  const columns = useMemo(() => getColumns(), []);

  // --- Data Fetching and Enrichment Logic ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch filter options if they haven't been loaded yet.
      // We fetch all of them at once to build our display maps.
      if (filterOptions.users.length === 0) {
        const [userRes, agentRes, convRes] = await Promise.all([
          apiClient.users.list({ size: 999 }),
          apiClient.agents.list({ limit: 99 }),
          apiClient.conversations.list({ limit: 999 }),
        ]);
        setFilterOptions({
          users: userRes.data,
          agents: agentRes.data,
          conversations: convRes.data,
        });
      }

      // 2. Prepare API parameters from pagination and filter state.
      const params: ListFeedbackParams = {
        page: pagination.pageIndex + 1, // API is 1-indexed
        limit: pagination.pageSize,
        order_by: "created_at",
        order: "desc",
      };

      if (filters.user_id !== "all") params.user_id = filters.user_id;
      if (filters.agent_id !== "all") params.agent_id = filters.agent_id;
      if (filters.conversation_id !== "all")
        params.conversation_id = filters.conversation_id;
      // The API doesn't filter by rating, so we'll do it client-side for now.
      // If the API supported it, we'd add:
      // if (filters.rating !== "all") params.rating = parseInt(filters.rating, 10);

      // 3. Fetch the feedback data from the API.
      const feedbackRes = await apiClient.conversations.listFeedbacks(params);
      const feedbacks = feedbackRes.data;

      // 4. Enrich the data: Map IDs to human-readable names.
      const userMap = new Map(
        filterOptions.users.map((u) => [u.id, u.name || u.email])
      );
      const agentMap = new Map(filterOptions.agents.map((a) => [a.id, a.name]));
      const convMap = new Map(
        filterOptions.conversations.map((c) => [c.id, c.title])
      );

      // This part is complex because we need to fetch each message to get its content and conversation ID.
      // This is an N+1 problem. A better API would return this data with the feedback.
      const enrichedDataPromises = feedbacks
        // Client-side filtering for rating
        .filter(
          (f) =>
            filters.rating === "all" || f.rating?.toString() === filters.rating
        )
        .map(async (feedback: FeedbackResponse) => {
          try {
            const message = await apiClient.conversations.getMessage(
              feedback.message_id
            );
            return {
              id: feedback.id,
              messageId: feedback.message_id,
              comment: feedback.comment,
              rating: feedback.rating,
              messageContent: message.content,
              userName: userMap.get(feedback.created_by_id!) || "Unknown User",
              agentName: agentMap.get(feedback.agent_id!) || "Unknown Agent",
              conversationTitle:
                convMap.get(message.conversation_id) || "Unknown Conversation",
            };
          } catch {
            // If a message or related item can't be fetched, return null to filter it out.
            return null;
          }
        });

      const resolvedData = (await Promise.all(enrichedDataPromises)).filter(
        Boolean
      ) as EnrichedFeedback[];

      setData(resolvedData);
      setPageCount(
        Math.ceil((feedbackRes.pages?.total || 0) / pagination.pageSize)
      );
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
      toast.error("Failed to load feedbacks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination, filters, filterOptions]);

  // Effect to trigger data fetching when pagination or filters change.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Table Instance ---
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Tell the table we're handling pagination on the server
  });

  // --- Handle Filter Changes ---
  const handleFilterChange = (
    filterName: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    // Reset to the first page when a filter is applied
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const exportData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.conversations.exportFeedbacks({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        user_id: filters.user_id !== "all" ? filters.user_id : undefined,
        agent_id: filters.agent_id !== "all" ? filters.agent_id : undefined,
        conversation_id:
          filters.conversation_id !== "all"
            ? filters.conversation_id
            : undefined,
        rating:
          filters.rating !== "all" ? parseInt(filters.rating, 10) : undefined,
      });
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "feedbacks.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export feedbacks:", error);
      toast.error("Failed to export feedbacks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
        Feedback List
      </h1>
      <p className="text-muted-foreground mt-2">
        A list of user feedback with server-side sorting and filtering.
      </p>
      <Separator className="my-6" />

      <div className="flex justify-end mb-4 gap-4 items-center">
        <Select
          value={filters.user_id}
          onValueChange={(value) => handleFilterChange("user_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by User..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {filterOptions.users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.agent_id}
          onValueChange={(value) => handleFilterChange("agent_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Agent..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {filterOptions.agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.conversation_id}
          onValueChange={(value) =>
            handleFilterChange("conversation_id", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Conversation..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conversations</SelectItem>
            {filterOptions.conversations.map((conv) => (
              <SelectItem key={conv.id} value={conv.id}>
                {conv.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.rating}
          onValueChange={(value) => handleFilterChange("rating", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by Rating..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="1">Like</SelectItem>
            <SelectItem value="0">Dislike</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" size="sm" onClick={() => exportData()}>
          Export to xlsx
        </Button>
      </div>

      {/* --- Data Table --- */}
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

      {/* --- Pagination Controls --- */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
