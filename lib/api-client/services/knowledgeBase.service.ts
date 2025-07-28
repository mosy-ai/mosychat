import type { BaseApiClient } from "../baseApiClient";
import type { BaseResponse } from "../types/base.types";
import type {
  CreateKnowledgeBaseRequest,
  KnowledgeBase,
  KnowledgeBaseListParams,
  UpdateKnowledgeBaseRequest,
} from "../types/knowledgeBase.types";

export class KnowledgeBaseService {
  constructor(private apiClient: BaseApiClient) {}

  async list(
    params: KnowledgeBaseListParams = {}
  ): Promise<BaseResponse<KnowledgeBase[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<KnowledgeBase[]>>(
      `/api/v1/knowledge-base${query}`
    );
  }

  async create(
    data: CreateKnowledgeBaseRequest
  ): Promise<BaseResponse<KnowledgeBase>> {
    return this.apiClient.request<BaseResponse<KnowledgeBase>>(
      "/api/v1/knowledge-base",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async get(id: string): Promise<BaseResponse<KnowledgeBase>> {
    return this.apiClient.request<BaseResponse<KnowledgeBase>>(
      `/api/v1/knowledge-base/${id}`
    );
  }

  async update(
    id: string,
    data: UpdateKnowledgeBaseRequest
  ): Promise<BaseResponse<KnowledgeBase>> {
    return this.apiClient.request<BaseResponse<KnowledgeBase>>(
      `/api/v1/knowledge-base/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async delete(id: string): Promise<BaseResponse<any>> {
    return this.apiClient.request<BaseResponse<any>>(
      `/api/v1/knowledge-base/${id}`,
      {
        method: "DELETE",
      }
    );
  }
}
