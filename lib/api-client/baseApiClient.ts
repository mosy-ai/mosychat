const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8696";

export class BaseApiClient {
  baseURL: string;
  token?: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
    console.log("Token set in BaseApiClient");
  }

  getHeaders(isFormData: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    

    // Handle cases where the response body might be empty (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }
    
    return {} as T;
  }

  async requestBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
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
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.blob();
  }
}
