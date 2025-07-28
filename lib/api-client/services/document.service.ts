import type { BaseApiClient } from "../baseApiClient";
import type { BaseResponse } from "../types/base.types";
import type {
  CreateDocumentRequest,
  Document,
  DocumentListParams,
  UpdateDocumentRequest,
} from "../types/document.types";

export class DocumentService {
  constructor(private apiClient: BaseApiClient) {}

  async list(
    params: DocumentListParams = {}
  ): Promise<BaseResponse<Document[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.size) searchParams.append("size", params.size.toString());
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.order) searchParams.append("order", params.order);
    if (params.statuses) {
      params.statuses.forEach((status) =>
        searchParams.append("statuses", status)
      );
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return this.apiClient.request<BaseResponse<Document[]>>(
      `/api/v1/documents${query}`
    );
  }

  async create(data: CreateDocumentRequest): Promise<BaseResponse<Document>> {
    const formData = new FormData();
    formData.append("document_dto", data.document_dto);
    if (data.file) {
      formData.append("file", data.file);
    }

    // Note: We use a raw fetch here because BaseApiClient.request stringifies the body
    const url = `${this.apiClient.baseURL}/api/v1/documents`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.apiClient.getHeaders(true), // Pass true to avoid 'Content-Type: application/json'
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  async get(id: string): Promise<Document> {
    return this.apiClient.request<Document>(`/api/v1/documents/${id}`);
  }

  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return this.apiClient.request<Document>(`/api/v1/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<Document> {
    return this.apiClient.request<Document>(`/api/v1/documents/${id}`, {
      method: "DELETE",
    });
  }

  async viewRawFile(id: string): Promise<any> {
    return this.apiClient.request<any>(`/api/v1/documents/${id}/raw`);
  }
}
