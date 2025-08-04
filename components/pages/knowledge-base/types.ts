import { Document, KnowledgeBase, DocumentPurpose } from "@/lib/api-client";

export interface StagedUploadItem {
  id: string;
  type: "FILE" | "URL";
  source: File | string;
  description: string;
  tags: string;
  purpose: DocumentPurpose;
}

export interface PendingUpload {
  id: string;
  type: "FILE" | "URL";
  name: string;
  purpose: DocumentPurpose;
  size?: number;
  status: "UPLOADING" | "ERROR";
  errorMessage?: string;
}

export interface KnowledgeBaseDetailProps {
  kbId: string;
}

export interface DocumentTableProps {
  documents: Document[];
  pendingUploads: PendingUpload[];
  onDeleteDocument: (docId: string) => void;
  onEditTags: (docId: string, tags: string[] | null) => void;
  onCancelEdit: (docId: string) => void;
  onSaveTags: (docId: string) => void;
  editingTags: { [key: string]: boolean };
  tempTags: { [key: string]: string };
  tagUpdateLoading: { [key: string]: boolean };
  setTempTags: (tags: { [key: string]: string }) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stagedItems: StagedUploadItem[];
  onStagedItemChange: (
    id: string,
    field: keyof StagedUploadItem,
    value: string | DocumentPurpose
  ) => void;
  onRemoveStagedItem: (id: string) => void;
  onStartUploads: () => void;
  isUploading: boolean;
  uploadType: "FILE" | "URL";
}

export interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stagedFiles: StagedUploadItem[];
  onStagedItemChange: (
    id: string,
    field: keyof StagedUploadItem,
    value: string | DocumentPurpose
  ) => void;
  onRemoveStagedItem: (id: string) => void;
  onStartFileUploads: () => void;
  isUploading: boolean;
  allTags: string[];
  getTagSuggestions: (input: string, existingTags?: string[]) => string[];
  isLoadingTags?: boolean;
  tagLoadError?: string | null;
}

export interface UrlUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stagedUrls: StagedUploadItem[];
  onStagedItemChange: (
    id: string,
    field: keyof StagedUploadItem,
    value: string | DocumentPurpose
  ) => void;
  onRemoveStagedItem: (id: string) => void;
  onStartUrlUploads: () => void;
  onAddUrl: () => void;
  isUploading: boolean;
  allTags: string[];
  getTagSuggestions: (input: string, existingTags?: string[]) => string[];
  isLoadingTags?: boolean;
  tagLoadError?: string | null;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
} 