// Base response interface
export interface BaseResponse<T = any> {
  status_code: number;
  message: string;
  data: T;
  pages?: {
    total: number;
    page: number;
    limit: number;
  } | null;
}

// Error response interface
export interface ErrorResponse {
  detail: Array<{
    loc: any[];
    msg: string;
    type: string;
  }>;
}
