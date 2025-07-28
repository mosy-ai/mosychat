import type { BaseApiClient } from "@/lib/api-client/baseApiClient";
import type { BaseResponse } from "@/lib/api-client/types/base.types";
import type {
  ConversationCreateDto,
  ConversationResponse,
  ConversationUpdateDto,
  FeedbackCreateDto,
  FeedbackResponse,
  FeedbackUpdateDto,
  GenerateTitleRequest,
  GenerateTitleResponse,
  ListFeedbackParams,
  MessageCreateDto,
  MessageResponse,
  MessageUpdateDto,
} from "@/lib/api-client/types/conversation.types";

export class ConversationService {
  constructor(private apiClient: BaseApiClient) {}

  // === Conversation methods ===
  async list(params: { page?: number; limit?: number } = {}): Promise<BaseResponse<ConversationResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<ConversationResponse[]>>(`/api/v1/conversations${query}`);
  }

  async create(data: ConversationCreateDto): Promise<ConversationResponse> {
    return this.apiClient.request<ConversationResponse>("/api/v1/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async get(conversation_id: string): Promise<ConversationResponse> {
    return this.apiClient.request<ConversationResponse>(`/api/v1/conversations/${conversation_id}`);
  }

  async update(conversation_id: string, data: ConversationUpdateDto): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/conversations/${conversation_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(conversation_id: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/conversations/${conversation_id}`, {
      method: "DELETE",
    });
  }

  async generateTitle(data: GenerateTitleRequest): Promise<GenerateTitleResponse> {
    return this.apiClient.request<GenerateTitleResponse>("/api/v1/conversations/generate-title", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // === Message methods ===
  async listMessages(
    params: { conversation_id?: string; page?: number; limit?: number } = {},
  ): Promise<BaseResponse<MessageResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.conversation_id) searchParams.append("conversation_id", params.conversation_id);
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<MessageResponse[]>>(`/api/v1/messages${query}`);
  }

  async createMessage(data: MessageCreateDto): Promise<MessageResponse> {
    return this.apiClient.request<MessageResponse>("/api/v1/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMessage(message_id: string): Promise<MessageResponse> {
    return this.apiClient.request<MessageResponse>(`/api/v1/messages/${message_id}`);
  }

  async updateMessage(message_id: string, data: MessageUpdateDto): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/messages/${message_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(message_id: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/messages/${message_id}`, {
      method: "DELETE",
    });
  }

  // === Feedback methods ===
  async listFeedbacks(params: ListFeedbackParams = {}): Promise<BaseResponse<FeedbackResponse[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<FeedbackResponse[]>>(`/api/v1/feedback${query}`);
  }

  async createFeedback(data: FeedbackCreateDto): Promise<FeedbackResponse> {
    return this.apiClient.request<FeedbackResponse>("/api/v1/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getFeedback(feedback_id: string): Promise<FeedbackResponse> {
    return this.apiClient.request<FeedbackResponse>(`/api/v1/feedback/${feedback_id}`);
  }

  async updateFeedback(feedback_id: string, data: FeedbackUpdateDto): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/feedback/${feedback_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFeedback(feedback_id: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/feedback/${feedback_id}`, {
      method: "DELETE",
    });
  }

  async exportFeedbacks(params: ListFeedbackParams = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.requestBlob(`/api/v1/feedback/export${query}`);
  }
}