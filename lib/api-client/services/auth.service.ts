import type { BaseApiClient } from '@/lib/api-client/baseApiClient';
import type { AuthResponse, CurrentUserResponse, LoginRequest, RegisterRequest } from '@/lib/api-client/types/auth.types';

export class AuthService {
  constructor(private apiClient: BaseApiClient) {}

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.apiClient.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.apiClient.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return this.apiClient.request<CurrentUserResponse>("/api/v1/auth/me");
  }
}