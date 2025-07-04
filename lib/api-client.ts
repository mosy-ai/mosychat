// BASE_URL = get from environment variable or hardcoded for development
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8696/';

// Base response interface
interface BaseResponse<T = any> {
  status_code: number;
  message: string;
  data: T;
  pages?: {
    current: number;
    total: number;
    per_page: number;
    total_items: number;
  } | null;
}

// Error response interface
interface ErrorResponse {
  detail: Array<{
    loc: any[];
    msg: string;
    type: string;
  }>;
}

// Knowledge Base interfaces
interface KnowledgeBase {
  id: string;
  name: string;
  user_ids?: string[] | null;
  created_at: string;
  updated_at: string;
}

interface CreateKnowledgeBaseRequest {
  name: string;
  user_ids?: string[] | null;
}

interface UpdateKnowledgeBaseRequest {
  name?: string | null;
  user_ids?: string[] | null;
}

interface KnowledgeBaseListParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: 'asc' | 'desc';
}

// Document interfaces
enum DocumentStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  INDEXING = 'INDEXING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  READING = 'READING'
}

interface Document {
  id: string;
  status: DocumentStatus;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_metadata?: object | null;
  description?: string | null;
  summary?: string | null;
  created_by: string;
  document_tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

interface DocumentListParams {
  page?: number;
  size?: number;
  order_by?: 'created_at' | 'updated_at' | 'file_size' | 'score';
  order?: 'asc' | 'desc';
  statuses?: string[];
}

interface CreateDocumentRequest {
  document_dto: string;
  file: File;
}

interface UpdateDocumentRequest {
  tags?: string[] | null;
}

// Auth interfaces
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: CurrentUserResponse;
  access_token: string;
}

interface CurrentUserResponse {
  sub: string;
}

// User interfaces
interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  document_count?: number | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
  langgr_url?: string | null;
  agent_name?: string | null;
  role?: string | null;
}

interface CreateUserRequest {
  email: string;
  name?: string | null;
  password: string;
  is_active: boolean;
  role?: string | null;
  langgr_url?: string | null;
  agent_name?: string | null;
}

interface UpdateUserRequest {
  email?: string | null;
  password?: string | null;
  name?: string | null;
  is_active?: boolean | null;
  role?: string | null;
  langgr_url?: string | null;
  agent_name?: string | null;
}

interface UserListParams {
  page?: number;
  size?: number;
  role?: string;
  order_by?: 'created_at' | 'updated_at' | 'username' | 'document_count' | 'name';
  order?: 'asc' | 'desc';
  is_active?: boolean;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Knowledge Base methods
  async listKnowledgeBases(params: KnowledgeBaseListParams = {}): Promise<BaseResponse<KnowledgeBase[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.order_by) searchParams.append('order_by', params.order_by);
    if (params.order) searchParams.append('order', params.order);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<BaseResponse<KnowledgeBase[]>>(`/api/v1/knowledge-base${query}`);
  }

  async createKnowledgeBase(data: CreateKnowledgeBaseRequest): Promise<BaseResponse<KnowledgeBase>> {
    return this.request<BaseResponse<KnowledgeBase>>('/api/v1/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getKnowledgeBase(id: string): Promise<BaseResponse<KnowledgeBase>> {
    return this.request<BaseResponse<KnowledgeBase>>(`/api/v1/knowledge-base/${id}`);
  }

  async updateKnowledgeBase(id: string, data: UpdateKnowledgeBaseRequest): Promise<BaseResponse<KnowledgeBase>> {
    return this.request<BaseResponse<KnowledgeBase>>(`/api/v1/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBase(id: string): Promise<BaseResponse<KnowledgeBase>> {
    return this.request<BaseResponse<KnowledgeBase>>(`/api/v1/knowledge-base/${id}`, {
      method: 'DELETE',
    });
  }

  // Document methods
  async listDocuments(params: DocumentListParams = {}): Promise<BaseResponse<Document[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.order_by) searchParams.append('order_by', params.order_by);
    if (params.order) searchParams.append('order', params.order);
    if (params.statuses) {
      params.statuses.forEach(status => searchParams.append('statuses', status));
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<BaseResponse<Document[]>>(`/api/v1/documents${query}`);
  }

  async createDocument(data: CreateDocumentRequest): Promise<BaseResponse<Document>> {
    const formData = new FormData();
    formData.append('document_dto', data.document_dto);
    formData.append('file', data.file);

    const url = `${this.baseURL}/api/v1/documents`;
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    // Don't set Content-Type for FormData, let the browser set it automatically

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getDocument(id: string): Promise<Document> {
    return this.request<Document>(`/api/v1/documents/${id}`);
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return this.request<Document>(`/api/v1/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string): Promise<Document> {
    return this.request<Document>(`/api/v1/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async viewRawFile(id: string): Promise<any> {
    return this.request<any>(`/api/v1/documents/${id}/raw`);
  }

  // Auth methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return this.request<CurrentUserResponse>('/api/v1/auth/me');
  }

  // User methods
  async listUsers(params: UserListParams = {}): Promise<BaseResponse<UserResponse[]>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.role) searchParams.append('role', params.role);
    if (params.order_by) searchParams.append('order_by', params.order_by);
    if (params.order) searchParams.append('order', params.order);
    if (params.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<BaseResponse<UserResponse[]>>(`/api/v1/users/${query}`);
  }

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUser(id: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/v1/users/${id}`);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export the client instance and types
export const apiClient = new ApiClient();
export type {
  BaseResponse,
  ErrorResponse,
  KnowledgeBase,
  CreateKnowledgeBaseRequest,
  UpdateKnowledgeBaseRequest,
  KnowledgeBaseListParams,
  Document,
  DocumentListParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CurrentUserResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
};
export { DocumentStatus, ApiClient };