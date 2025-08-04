import { useState, useEffect, useMemo, useCallback } from "react";
import { PaginationState } from "@tanstack/react-table";
import { apiClient } from "@/lib/api-client";
import type { ListFeedbackParams } from "@/lib/api-client/types/conversation.types";
import type { UserResponse } from "@/lib/api-client/types/user.types";
import type { AgentResponse } from "@/lib/api-client/types/agent.types";
import type { ConversationResponse } from "@/lib/api-client/types/conversation.types";
import { EnrichedFeedback, FilterOptions, Filters } from "@/components/pages/feedbacks/types";
import { toast } from "sonner";

export function useFeedbacks() {
  const [data, setData] = useState<EnrichedFeedback[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    users: [],
    agents: [],
    conversations: [],
  });

  const [filters, setFilters] = useState<Filters>({
    user_id: "all",
    agent_id: "all",
    conversation_id: "all",
    rating: "all",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch filter options if they haven't been loaded yet
      if (filterOptions.users.length === 0) {
        const [userRes, agentRes, convRes] = await Promise.all([
          apiClient.users.list({ size: 999 }),
          apiClient.agents.list({ limit: 99 }),
          apiClient.conversations.list({ limit: 15 }),
        ]);
        setFilterOptions({
          users: userRes.data,
          agents: agentRes.data,
          conversations: convRes.data,
        });
      }

      // 2. Prepare API parameters from pagination and filter state
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
      if (filters.rating !== "all") params.rating = parseInt(filters.rating);

      // 3. Fetch the feedback data from the API
      const feedbackRes = await apiClient.conversations.listFeedbacks(params);
      const feedbacks = feedbackRes.data;

      // 4. Enrich the data: Map IDs to human-readable names
      const convMap = new Map(
        filterOptions.conversations.map((c) => [c.id, c.title])
      );

      const enrichedData = feedbacks
        .map((feedback: any): EnrichedFeedback | null => {
          if (!feedback.message || !feedback.created_by) {
            console.warn(
              "Skipping feedback item due to missing nested data:",
              feedback.id
            );
            return null;
          }

          return {
            id: feedback.id,
            messageId: feedback.message_id,
            comment: feedback.comment || null,
            rating: feedback.rating || null,
            messageContent: feedback.message.content,
            userName:
              feedback.created_by.name ||
              feedback.created_by.email ||
              "Unknown User",
            agentName: feedback.agent_name || "Unknown Agent",
            conversationTitle:
              convMap.get(feedback.message.conversation_id) ||
              "Unknown Conversation",
          };
        })
        .filter(Boolean) as EnrichedFeedback[];

      setData(enrichedData);
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (
    filterName: keyof Filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination);
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

  return {
    data,
    pageCount,
    isLoading,
    pagination,
    filters,
    filterOptions,
    handleFilterChange,
    handlePaginationChange,
    exportData,
  };
} 