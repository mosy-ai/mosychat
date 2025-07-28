import type { BaseApiClient } from "../baseApiClient";
import type { BaseResponse } from "../types/base.types";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
  UserResponse,
} from "../types/user.types";

export class UserService {
  constructor(private apiClient: BaseApiClient) {}

  async list(
    params: UserListParams = {}
  ): Promise<BaseResponse<UserResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.size) searchParams.append("size", params.size.toString());
    if (params.role) searchParams.append("role", params.role);
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    if (params.is_active !== undefined)
      searchParams.append("is_active", params.is_active.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<UserResponse[]>>(
      `/api/v1/users${query}`
    );
  }

  async create(data: CreateUserRequest): Promise<UserResponse> {
    return this.apiClient.request<UserResponse>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async get(id: string): Promise<UserResponse> {
    return this.apiClient.request<UserResponse>(`/api/v1/users/${id}`);
  }

  async update(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return this.apiClient.request<UserResponse>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<UserResponse> {
    return this.apiClient.request<UserResponse>(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
  }
}
