import type { BaseApiClient } from "../baseApiClient";
import type { BaseResponse } from "../types/base.types";
import type {
  CreateTagRequest,
  UpdateTagRequest,
  TagListParams,
  TagResponse,
} from "../types/tag.types";

export class TagService {
  constructor(private apiClient: BaseApiClient) {}

  async list(
    params: TagListParams = {}
  ): Promise<BaseResponse<TagResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    if (params.keyword !== undefined && params.keyword !== null)
      searchParams.append("keyword", params.keyword);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<TagResponse[]>>(
      `/api/v1/tags${query}`
    );
  }

  async create(data: CreateTagRequest): Promise<TagResponse> {
    return this.apiClient.request<TagResponse>("/api/v1/tags", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async get(id: string): Promise<TagResponse> {
    return this.apiClient.request<TagResponse>(`/api/v1/tags/${id}`);
  }

  async update(id: string, data: UpdateTagRequest): Promise<TagResponse> {
    return this.apiClient.request<TagResponse>(`/api/v1/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return this.apiClient.request<void>(`/api/v1/tags/${id}`, {
      method: "DELETE",
    });
  }
} 