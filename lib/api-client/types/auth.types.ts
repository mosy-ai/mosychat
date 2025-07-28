import type { UserResponse } from "./user.types";

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: CurrentUserResponse;
  access_token: string;
}

export interface CurrentUserResponse {
  sub: string;
}
