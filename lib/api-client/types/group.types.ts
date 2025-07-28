import type { UserResponse } from "./user.types";

// Group interfaces
export interface GroupResponse {
  id: string;
  name: string;
  description: string;
  user_ids?: string[] | null;
  users?: UserResponse[] | null;
  user_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreateDto {
  name: string;
  description: string;
  user_ids?: string[] | null;
}

export interface GroupUpdateDto {
  name?: string | null;
  description?: string | null;
  user_ids?: string[] | null;
}

export interface GroupListParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: "asc" | "desc";
}
