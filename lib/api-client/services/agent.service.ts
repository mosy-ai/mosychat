import type { BaseApiClient } from "../baseApiClient";
import type {
  AgentCreateDto,
  AgentListParams,
  AgentResponse,
  AgentUpdateDto,
  ChatRequest,
  ChatResponse,
} from "../types/agent.types";
import type { BaseResponse } from "../types/base.types";

export class AgentService {
  constructor(private apiClient: BaseApiClient) {}

  // Agent CRUD methods
  async list(
    params: AgentListParams = {}
  ): Promise<BaseResponse<AgentResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<AgentResponse[]>>(
      `/api/v1/agents${query}`
    );
  }

  async create(data: AgentCreateDto): Promise<BaseResponse<AgentResponse>> {
    return this.apiClient.request<BaseResponse<AgentResponse>>(
      "/api/v1/agents",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async get(agentId: string): Promise<BaseResponse<AgentResponse>> {
    return this.apiClient.request<BaseResponse<AgentResponse>>(
      `/api/v1/agents/${agentId}`
    );
  }

  async update(
    agentId: string,
    data: AgentUpdateDto
  ): Promise<BaseResponse<AgentResponse>> {
    return this.apiClient.request<BaseResponse<AgentResponse>>(
      `/api/v1/agents/${agentId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async delete(agentId: string): Promise<BaseResponse<AgentResponse>> {
    return this.apiClient.request<BaseResponse<AgentResponse>>(
      `/api/v1/agents/${agentId}`,
      {
        method: "DELETE",
      }
    );
  }

  // Agent chat (non-streaming)
  async chat(data: ChatRequest): Promise<ChatResponse> {
    return this.apiClient.request<ChatResponse>("/api/v1/agents/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Agent chat (streaming)
  async chatStream(data: ChatRequest): Promise<Response> {
    const url = `${this.apiClient.baseURL}/api/v1/agents/chat/stream`;
    return fetch(url, {
      method: "POST",
      headers: this.apiClient.getHeaders(),
      body: JSON.stringify(data),
    });
  }
}
