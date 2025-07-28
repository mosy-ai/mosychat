// Document enums and interfaces
export enum DocumentStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  INDEXING = "INDEXING",
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
  READING = "READING",
}

export enum DocumentPurpose {
  ATTACHMENT = "ATTACHMENT",
  KNOWLEDGE_BASE = "KNOWLEDGE_BASE",
}

export interface Document {
  id: string;
  status: DocumentStatus;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  file_metadata?: object | null;
  file_upload_type: string; // "FILE" or "URL"
  description?: string | null;
  purpose: DocumentPurpose;
  summary?: string | null;
  created_by: string;
  document_tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListParams {
  page?: number;
  size?: number;
  order_by?: "created_at" | "updated_at" | "file_size" | "score";
  order?: "asc" | "desc";
  statuses?: string[];
}

export interface CreateDocumentRequest {
  document_dto: string;
  file?: File | null;
  file_upload_type: string; // "FILE" or "URL"
}

export interface UpdateDocumentRequest {
  tags?: string[] | null;
}
