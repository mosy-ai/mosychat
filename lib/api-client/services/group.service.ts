import type { BaseApiClient } from "../baseApiClient";
import type { BaseResponse } from "../types/base.types";
import type {
  GroupCreateDto,
  GroupListParams,
  GroupResponse,
  GroupUpdateDto,
} from "../types/group.types";

export class GroupService {
  constructor(private apiClient: BaseApiClient) {}

  async list(
    params: GroupListParams = {}
  ): Promise<BaseResponse<GroupResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<GroupResponse[]>>(
      `/api/v1/groups${query}`
    );
  }

  async create(data: GroupCreateDto): Promise<BaseResponse<GroupResponse>> {
    return this.apiClient.request<BaseResponse<GroupResponse>>(
      "/api/v1/groups",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async get(groupId: string): Promise<BaseResponse<GroupResponse>> {
    return this.apiClient.request<BaseResponse<GroupResponse>>(
      `/api/v1/groups/${groupId}`
    );
  }

  async update(
    groupId: string,
    data: GroupUpdateDto
  ): Promise<BaseResponse<GroupResponse>> {
    return this.apiClient.request<BaseResponse<GroupResponse>>(
      `/api/v1/groups/${groupId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async delete(groupId: string): Promise<BaseResponse<any>> {
    return this.apiClient.request<BaseResponse<any>>(
      `/api/v1/groups/${groupId}`,
      {
        method: "DELETE",
      }
    );
  }
}
