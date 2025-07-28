// Feedback interfaces
export interface FeedbackCreateDto {
  id?: string; // Optional on creation
  message_id: string;
  rating?: number | null;
  comment?: string | null;
}

export interface FeedbackUpdateDto {
  rating?: number | null;
  comment?: string | null;
}

export interface FeedbackResponse {
  id: string;
  message_id: string;
  created_by_id?: string | null;
  agent_id?: string | null;
  rating?: number | null;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListFeedbackParams {
  page?: number;
  limit?: number;
  order_by?: string;
  order?: "asc" | "desc";
  rating?: number;
  message_id?: string;
  conversation_id?: string;
  agent_id?: string;
  user_id?: string;
}

// Message interfaces
export interface MessageCreateDto {
  id?: string;
  conversation_id: string;
  role: string;
  content: string;
  attachments?: any[];
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  role: string;
  attachments?: any[];
  content: string;
  feedback?: FeedbackResponse[] | null;
  feedback_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface MessageUpdateDto {
  role?: string;
  content?: string;
}

// Conversation interfaces
export interface ConversationCreateDto {
  title: string;
  id?: string;
  agent_id: string;
}

export interface ConversationResponse {
  id: string;
  user_id: string;
  title: string;
  messages?: MessageResponse[] | null;
  agent_id: string;
  message_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationUpdateDto {
  title?: string;
  agent_id?: string;
}

// Generate Conversation Title interfaces
export interface GenerateTitleRequest {
  conversation_id: string;
  messages: any[]; // Matching the schema
}

export interface GenerateTitleResponse {
  title: string;
}
