import { UserResponse, AgentResponse, ConversationResponse } from "@/lib/api-client";

export type EnrichedFeedback = {
  id: string;
  messageId: string;
  comment: string | null;
  rating: number | null;
  messageContent: string;
  userName: string;
  agentName: string;
  conversationTitle: string;
};

export type FilterOptions = {
  users: UserResponse[];
  agents: AgentResponse[];
  conversations: ConversationResponse[];
};

export type Filters = {
  user_id: string;
  agent_id: string;
  conversation_id: string;
  rating: string;
};

export interface FeedbacksListProps {
  data: EnrichedFeedback[];
  isLoading: boolean;
  filters: Filters;
  filterOptions: FilterOptions;
  onFilterChange: (filterName: keyof Filters, value: string) => void;
  onExport: () => void;
}

export interface FeedbacksTableProps {
  data: EnrichedFeedback[];
  isLoading: boolean;
}

export interface FeedbacksFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFilterChange: (filterName: keyof Filters, value: string) => void;
  onExport: () => void;
  isLoading: boolean;
}

export interface FeedbacksPaginationProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
} 