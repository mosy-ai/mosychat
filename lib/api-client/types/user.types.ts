// User interfaces
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  document_count?: number | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
  langgr_url?: string | null;
  agent_name?: string | null;
  role?: string | null;
}

export interface CreateUserRequest {
  email: string;
  name?: string | null;
  password: string;
  is_active: boolean;
  role?: string | null;
  langgr_url?: string | null;
  agent_name?: string | null;
}

export interface UpdateUserRequest {
  email?: string | null;
  password?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  role?: string | null;
  langgr_url?: string | null;
  agent_name?: string | null;
}

export interface UserListParams {
  page?: number;
  size?: number;
  role?: string;
  order_by?:
    | "created_at"
    | "updated_at"
    | "username"
    | "document_count"
    | "name";
  order?: "asc" | "desc";
  is_active?: boolean;
}
