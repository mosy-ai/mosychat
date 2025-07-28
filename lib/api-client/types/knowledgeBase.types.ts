import type { Document } from "./document.types";
import type { GroupResponse } from "./group.types";
import type { UserResponse } from "./user.types";

// Knowledge Base interfaces
export interface KnowledgeBase {
  id: string;
  name: string;
  user_ids?: string[] | null;
  group_ids?: string[] | null;
  users?: UserResponse[] | null;
  groups?: GroupResponse[] | null;
  documents?: Document[] | null;
  document_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  user_ids?: string[] | null;
  group_ids?: string[] | null;
}

export interface UpdateKnowledgeBaseRequest {
  name?: string | null;
  user_ids?: string[] | null;
  group_ids?: string[] | null;
}

export interface KnowledgeBaseListParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: "asc" | "desc";
}
