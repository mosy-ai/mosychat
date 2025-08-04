// Tag interfaces
export interface TagResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name?: string | null;
}

export interface TagListParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: "asc" | "desc";
  keyword?: string | null;
} 