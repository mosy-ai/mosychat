import type { UserResponse } from "./user.types";

// Agent interfaces
export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  created_by_id: string;
  created_by?: UserResponse | null;
  user_ids: string[];
  group_ids: string[];
  knowledge_base_ids: string[];
  users: UserResponse[];
  groups: any[];
  knowledge_bases: any[];
  user_count: number;
  group_count: number;
  knowledge_base_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentCreateDto {
  name: string;
  description: string;
  user_ids?: string[] | null;
  group_ids?: string[] | null;
  knowledge_base_ids?: string[] | null;
}

export interface AgentUpdateDto {
  name?: string | null;
  description?: string | null;
  user_ids?: string[] | null;
  group_ids?: string[] | null;
  knowledge_base_ids?: string[] | null;
}

export interface AgentListParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: "asc" | "desc";
}

// Agent Chat interfaces
export interface ContentItem {
  type: string;
  text: string;
}

export interface Message {
  role: string;
  content: ContentItem[];
}

export interface ChatRequest {
  messages: Message[];
  tools?: object;
  unstable_assistantMessageId?: string;
  runConfig?: object;
  state?: object;
}

export interface ChatResponse {
  content: string;
}
