import { useState, useEffect, useMemo, useRef } from "react";
import { apiClient, KnowledgeBase, Document, DocumentPurpose } from "@/lib/api-client";
import { StagedUploadItem, PendingUpload } from "@/components/pages/knowledge-base/types";

export function useKnowledgeBaseDetail(kbId: string) {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingTags, setEditingTags] = useState<{ [key: string]: boolean }>({});
  const [tempTags, setTempTags] = useState<{ [key: string]: string }>({});
  
  // Separate upload modal states
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isUrlUploadModalOpen, setIsUrlUploadModalOpen] = useState(false);
  
  // Separate staged items
  const [stagedFiles, setStagedFiles] = useState<StagedUploadItem[]>([]);
  const [stagedUrls, setStagedUrls] = useState<StagedUploadItem[]>([]);
  
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tagUpdateLoading, setTagUpdateLoading] = useState<{ [key: string]: boolean }>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Enhanced tag management
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagLoadError, setTagLoadError] = useState<string | null>(null);

  // File input ref to clear it when modal closes
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate pagination state for files and URLs
  const [fileCurrentPage, setFileCurrentPage] = useState(1);
  const [urlCurrentPage, setUrlCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load all tags from API
  const loadAllTags = async () => {
    setIsLoadingTags(true);
    setTagLoadError(null);
    try {
      const response = await apiClient.tags.list({ limit: 1000 }); // Get all tags
      const tagNames = response.data.map(tag => tag.name);
      setAllTags(tagNames);
    } catch (err: any) {
      console.error("Failed to load tags:", err);
      setTagLoadError(err.message || "Failed to load tags");
      // Fallback to loading tags from existing documents
      const documentTags = new Set<string>();
      documents.forEach(doc => {
        if (doc.document_tags) {
          doc.document_tags.forEach(tag => documentTags.add(tag.toLowerCase()));
        }
      });
      setAllTags(Array.from(documentTags).sort());
    } finally {
      setIsLoadingTags(false);
    }
  };

  const loadData = async () => {
    setIsPageLoading(true);
    setPageError(null);
    try {
      const [kbResponse] = await Promise.all([
        apiClient.knowledgeBases.get(kbId),
      ]);
      setKb(kbResponse.data);
      setDocuments(kbResponse.data.documents || []);
    } catch (err: any) {
      setPageError(err.message || "Failed to load knowledge base details.");
    } finally {
      setIsPageLoading(false);
    }
  };

  // Enhanced tag suggestion logic with better ranking
  const getTagSuggestions = (input: string, existingTags: string[] = []): string[] => {
    if (!input.trim()) {
      // Return popular tags when no input
      return allTags.slice(0, 5);
    }
    
    const query = input.toLowerCase().trim();
    const existingSet = new Set(existingTags.map(tag => tag.toLowerCase()));
    
    // Score and rank suggestions
    const scoredSuggestions = allTags
      .filter(tag => !existingSet.has(tag.toLowerCase()))
      .map(tag => {
        const tagLower = tag.toLowerCase();
        let score = 0;
        
        // Exact match gets highest score
        if (tagLower === query) score += 100;
        // Starts with query gets high score
        else if (tagLower.startsWith(query)) score += 50;
        // Contains query gets medium score
        else if (tagLower.includes(query)) score += 25;
        // Partial match gets lower score
        else if (query.split(' ').some(word => tagLower.includes(word))) score += 10;
        
        return { tag, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tag)
      .slice(0, 8); // Return top 8 suggestions
    
    return scoredSuggestions;
  };



  useEffect(() => {
    if (kbId) {
      loadData();
      loadAllTags(); // Load tags when component mounts
    }
  }, [kbId]);

  // Update all tags when documents change (fallback)
  useEffect(() => {
    if (allTags.length === 0 && documents.length > 0) {
      const documentTags = new Set<string>();
      documents.forEach(doc => {
        if (doc.document_tags) {
          doc.document_tags.forEach(tag => documentTags.add(tag.toLowerCase()));
        }
      });
      setAllTags(Array.from(documentTags).sort());
    }
  }, [documents, allTags.length]);

  // Reset to first page when documents change
  useEffect(() => {
    setFileCurrentPage(1);
    setUrlCurrentPage(1);
  }, [documents.length]);

  const fileDocuments = useMemo(
    () => documents.filter((doc) => doc.file_upload_type === "FILE"),
    [documents]
  );

  const urlDocuments = useMemo(
    () => documents.filter((doc) => doc.file_upload_type === "URL"),
    [documents]
  );

  const pendingFileDocuments = useMemo(
    () => pendingUploads.filter((p) => p.type === "FILE"),
    [pendingUploads]
  );

  const pendingUrlDocuments = useMemo(
    () => pendingUploads.filter((p) => p.type === "URL"),
    [pendingUploads]
  );

  // Separate pagination calculations for files and URLs
  const fileTotalPages = useMemo(() => {
    return Math.ceil(fileDocuments.length / itemsPerPage);
  }, [fileDocuments.length, itemsPerPage]);

  const urlTotalPages = useMemo(() => {
    return Math.ceil(urlDocuments.length / itemsPerPage);
  }, [urlDocuments.length, itemsPerPage]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newStagedItems: StagedUploadItem[] = Array.from(files).map((file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        type: "FILE" as const,
        source: file,
        description: "",
        tags: "",
        purpose: DocumentPurpose.KNOWLEDGE_BASE,
      }));
      setStagedFiles((prev) => [...prev, ...newStagedItems]);
      setIsFileUploadModalOpen(true);
    }
  };

  const handleAddUrlClick = () => {
    const newStagedItem: StagedUploadItem = {
      id: `url-${Date.now()}-${Math.random()}`,
      type: "URL" as const,
      source: "",
      description: "",
      tags: "",
      purpose: DocumentPurpose.KNOWLEDGE_BASE,
    };
    setStagedUrls((prev) => [...prev, newStagedItem]);
    setIsUrlUploadModalOpen(true);
  };

  const handleAddUrl = () => {
    const newStagedItem: StagedUploadItem = {
      id: `url-${Date.now()}-${Math.random()}`,
      type: "URL" as const,
      source: "",
      description: "",
      tags: "",
      purpose: DocumentPurpose.KNOWLEDGE_BASE,
    };
    setStagedUrls((prev) => [...prev, newStagedItem]);
  };

  const handleStagedItemChange = (
    id: string,
    field: keyof StagedUploadItem,
    value: string | DocumentPurpose
  ) => {
    // Update staged files
    setStagedFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    
    // Update staged URLs
    setStagedUrls((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
    setStagedUrls((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear staged items when modals are closed
  const handleFileUploadModalClose = (open: boolean) => {
    if (!open) {
      setStagedFiles([]);
      // Clear the file input so the same files can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setIsFileUploadModalOpen(open);
  };

  const handleUrlUploadModalClose = (open: boolean) => {
    if (!open) {
      setStagedUrls([]);
    }
    setIsUrlUploadModalOpen(open);
  };

  const handleStartFileUploads = async () => {
    setIsUploading(true);
    const newPendingUploads: PendingUpload[] = stagedFiles.map((item) => ({
      id: item.id,
      type: item.type,
      name: (item.source as File).name,
      purpose: item.purpose,
      size: (item.source as File).size,
      status: "UPLOADING" as const,
    }));

    setPendingUploads((prev) => [...prev, ...newPendingUploads]);
    setStagedFiles([]);
    setIsFileUploadModalOpen(false);

    // Clear the file input after successful upload
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Process each staged file individually
    stagedFiles.forEach((item) => {
      const tagsArray = (item.tags || "")
        .split(/,|\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const documentDto = JSON.stringify({
        knowledge_base_id: kbId,
        purpose: item.purpose,
        description: item.description.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
      });

      apiClient.documents
        .create({
          document_dto: documentDto,
          file: item.source as File,
          file_upload_type: "FILE",
        })
        .then((response) => {
          setDocuments((prev) => [...prev, response.data]);
          setPendingUploads((prev) => prev.filter((p) => p.id !== item.id));
        })
        .catch((error) => {
          console.error(`Failed to upload file:`, error);
          setPendingUploads((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "ERROR" as const, errorMessage: `Upload failed: ${error.message}` }
                : p
            )
          );
        });
    });

    setTimeout(() => {
      setPendingUploads([]);
      setIsUploading(false);
    }, 1000);
  };

  const handleStartUrlUploads = async () => {
    setIsUploading(true);
    const newPendingUploads: PendingUpload[] = stagedUrls.map((item) => ({
      id: item.id,
      type: item.type,
      name: item.source as string,
      purpose: item.purpose,
      status: "UPLOADING" as const,
    }));

    setPendingUploads((prev) => [...prev, ...newPendingUploads]);
    setStagedUrls([]);
    setIsUrlUploadModalOpen(false);

    // Process each staged URL individually
    stagedUrls.forEach((item) => {
      const tagsArray = (item.tags || "")
        .split(/,|\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const documentDto = JSON.stringify({
        knowledge_base_id: kbId,
        purpose: item.purpose,
        description: item.description.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        url: item.source,
      });

      apiClient.documents
        .create({
          document_dto: documentDto,
          file_upload_type: "URL",
        })
        .then((response) => {
          setDocuments((prev) => [...prev, response.data]);
          setPendingUploads((prev) => prev.filter((p) => p.id !== item.id));
        })
        .catch((error) => {
          console.error(`Failed to upload URL:`, error);
          setPendingUploads((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "ERROR" as const, errorMessage: `Upload failed: ${error.message}` }
                : p
            )
          );
        });
    });

    setTimeout(() => {
      setPendingUploads([]);
      setIsUploading(false);
    }, 1000);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await apiClient.documents.delete(docId);
        setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
      } catch (err: any) {
        alert(err.message || "Failed to delete document.");
      }
    }
  };

  const handleEditTags = (docId: string, tags: string[] | null) => {
    setEditingTags((prev) => ({ ...prev, [docId]: true }));
    setTempTags((prev) => ({
      ...prev,
      [docId]: tags ? tags.join(", ") : "",
    }));
  };

  const handleCancelEdit = (docId: string) => {
    setEditingTags((prev) => ({ ...prev, [docId]: false }));
    setTempTags((prev) => {
      const newTags = { ...prev };
      delete newTags[docId];
      return newTags;
    });
  };

  const handleSaveTags = async (docId: string) => {
    setTagUpdateLoading((prev) => ({ ...prev, [docId]: true }));
    try {
      const tags = tempTags[docId]
        ? tempTags[docId].split(",").map((t) => t.trim())
        : [];
      await apiClient.documents.update(docId, { tags });
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, document_tags: tags } : doc
        )
      );
      handleCancelEdit(docId);
    } catch (err: any) {
      alert(err.message || "Failed to update tags.");
    } finally {
      setTagUpdateLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "—";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const handleFilePageChange = (page: number) => {
    setFileCurrentPage(page);
  };

  const handleUrlPageChange = (page: number) => {
    setUrlCurrentPage(page);
  };

  return {
    kb,
    documents,
    editingTags,
    tempTags,
    isFileUploadModalOpen,
    isUrlUploadModalOpen,
    stagedFiles,
    stagedUrls,
    pendingUploads,
    isPageLoading,
    tagUpdateLoading,
    pageError,
    isUploading,
    fileDocuments,
    urlDocuments,
    pendingFileDocuments,
    pendingUrlDocuments,
    fileCurrentPage,
    urlCurrentPage,
    fileTotalPages,
    urlTotalPages,
    itemsPerPage,
    allTags,
    getTagSuggestions,
    isLoadingTags,
    tagLoadError,
    fileInputRef,
    setTempTags,
    handleFileUploadModalClose,
    handleUrlUploadModalClose,
    handleFileSelect,
    handleAddUrlClick,
    handleAddUrl,
    handleStagedItemChange,
    handleRemoveStagedItem,
    handleStartFileUploads,
    handleStartUrlUploads,
    handleDeleteDocument,
    handleEditTags,
    handleCancelEdit,
    handleSaveTags,
    handleFilePageChange,
    handleUrlPageChange,
    formatFileSize,
  };
} 