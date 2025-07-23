"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconLoader,
  IconAlertCircle,
  IconArrowLeft,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Shadcn Select Component Imports ---
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- API Client Imports (including the new enum) ---
import {
  Document,
  KnowledgeBase,
  apiClient,
  DocumentPurpose,
} from "@/lib/api-client";

export default function KnowledgeBaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kbId = params.id;

  // --- State Management ---
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingTags, setEditingTags] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [tempTags, setTempTags] = useState<{ [key: string]: string }>({});
  const [urlInput, setUrlInput] = useState("");
  // -- NEW STATE for managing the selected upload purpose --
  const [uploadPurpose, setUploadPurpose] = useState<DocumentPurpose>(
    DocumentPurpose.KNOWLEDGE_BASE
  );

  // --- Loading and Error States ---
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  const [tagUpdateLoading, setTagUpdateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [pageError, setPageError] = useState<string | null>(null);

  // --- Data Fetching and Authorization ---
  const loadData = async () => {
    setIsPageLoading(true);
    setPageError(null);
    try {
      const kbResponse = await apiClient.getKnowledgeBase(kbId);

      if (
        kbResponse.status_code !== 200
      ) {
        router.push("/dashboard/knowledge-base");
        return;
      }

      setKb(kbResponse.data);
      setDocuments(kbResponse.data.documents || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPageError(
        "Failed to load knowledge base data. Please try again later."
      );
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    if (kbId) {
      loadData();
    }
  }, [kbId]);

  // --- Document Creation Handlers (Updated with Purpose) ---
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => {
        // --- ADD `purpose` to the DTO ---
        const documentDto = JSON.stringify({
          knowledge_base_id: kbId,
          purpose: uploadPurpose,
        });
        return apiClient.createDocument({
          document_dto: documentDto,
          file: file,
          file_upload_type: "FILE",
        });
      });
      await Promise.all(uploadPromises);
      await loadData();
    } catch (error) {
      console.error("Failed to upload document(s):", error);
      alert("Failed to upload one or more documents.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    setIsSubmittingUrl(true);
    try {
      // --- ADD `purpose` to the DTO ---
      const documentDto = JSON.stringify({
        knowledge_base_id: kbId,
        url: urlInput,
        purpose: uploadPurpose,
      });

      await apiClient.createDocument({
        document_dto: documentDto,
        file_upload_type: "URL",
      });
      await loadData();
      setUrlInput("");
    } catch (error) {
      console.error("Failed to submit URL:", error);
      alert(
        "Failed to submit URL. Please ensure it is a valid and accessible link."
      );
    } finally {
      setIsSubmittingUrl(false);
    }
  };

  // --- Other handlers remain unchanged ---
  const handleDeleteDocument = async (docId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    )
      return;
    try {
      await apiClient.deleteDocument(docId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document.");
    }
  };

  const handleEditTags = (docId: string, tags: string[] | null) => {
    setEditingTags((prev) => ({ ...prev, [docId]: true }));
    setTempTags((prev) => ({ ...prev, [docId]: tags ? tags.join(", ") : "" }));
  };

  const handleCancelEdit = (docId: string) => {
    setEditingTags((prev) => ({ ...prev, [docId]: false }));
  };

  const handleSaveTags = async (docId: string) => {
    setTagUpdateLoading((prev) => ({ ...prev, [docId]: true }));
    try {
      const tagsArray = (tempTags[docId] || "")
        .split(/,|\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      await apiClient.updateDocument(docId, {
        document_tags: tagsArray.length > 0 ? tagsArray : null,
      });
      setDocuments((prev) =>
        prev.map((file) =>
          file.id === docId
            ? {
                ...file,
                document_tags: tagsArray.length > 0 ? tagsArray : null,
              }
            : file
        )
      );
      setEditingTags((prev) => ({ ...prev, [docId]: false }));
    } catch (error) {
      console.error("Error updating tags:", error);
      alert("Failed to update tags.");
    } finally {
      setTagUpdateLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const fileDocuments = useMemo(
    () => documents.filter((doc) => doc.file_upload_type === "FILE"),
    [documents]
  );
  const urlDocuments = useMemo(
    () => documents.filter((doc) => doc.file_upload_type === "URL"),
    [documents]
  );

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <IconLoader className="animate-spin" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Common UI component for upload controls
  const UploadControls = ({ type }: { type: "FILE" | "URL" }) => (
    <div className="flex justify-end gap-2 items-center">
      <Select
        value={uploadPurpose}
        onValueChange={(value) => setUploadPurpose(value as DocumentPurpose)}
        disabled={isUploading || isSubmittingUrl}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select purpose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DocumentPurpose.KNOWLEDGE_BASE}>
            Knowledge Base
          </SelectItem>
          <SelectItem value={DocumentPurpose.ATTACHMENT}>Attachment</SelectItem>
        </SelectContent>
      </Select>
      {type === "FILE" ? (
        <>
          <Input
            type="file"
            className="max-w-xs"
            multiple
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button variant="default" size="sm" disabled={isUploading}>
            {isUploading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />{" "}
                Uploading...
              </>
            ) : (
              "Upload Files"
            )}
          </Button>
        </>
      ) : (
        <>
          <Input
            type="text"
            className="max-w-xs"
            placeholder="Enter article URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isSubmittingUrl}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={isSubmittingUrl}
          >
            {isSubmittingUrl ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />{" "}
                Submitting...
              </>
            ) : (
              "Add URL"
            )}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-balance">
              {kb?.name}
            </h1>
            <span className="italic font-light text-sm text-muted-foreground">
              ID: {kbId}
            </span>
          </div>
        </div>
        <Separator />

        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Files</TabsTrigger>
            <TabsTrigger value="url">URLs</TabsTrigger>
          </TabsList>

          <TabsContent
            value="file"
            className="flex flex-col gap-4 md:gap-6 mt-4"
          >
            <UploadControls type="FILE" />
            <Table>
              <TableCaption>A list of your uploaded files.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileDocuments.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      <Tooltip>
                        <TooltipTrigger>{file.file_name}</TooltipTrigger>
                        <TooltipContent>{file.file_name}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {editingTags[file.id] ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempTags[file.id] || ""}
                            onChange={(e) =>
                              setTempTags((prev) => ({
                                ...prev,
                                [file.id]: e.target.value,
                              }))
                            }
                            disabled={tagUpdateLoading[file.id]}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveTags(file.id)}
                            disabled={tagUpdateLoading[file.id]}
                          >
                            {tagUpdateLoading[file.id] ? (
                              <IconLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <IconCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelEdit(file.id)}
                            disabled={tagUpdateLoading[file.id]}
                          >
                            <IconX className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {file.document_tags?.length ? (
                              file.document_tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No tags
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleEditTags(file.id, file.document_tags)
                            }
                          >
                            <IconEdit className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          file.purpose === DocumentPurpose.KNOWLEDGE_BASE
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {file.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(file.file_size)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          file.status === "COMPLETED" ? "default" : "outline"
                        }
                      >
                        {file.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(file.id)}
                      >
                        <IconTrash className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent
            value="url"
            className="flex flex-col gap-4 md:gap-6 mt-4"
          >
            <UploadControls type="URL" />
            <Table>
              <TableCaption>A list of your submitted URLs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Purpose</TableHead> {/* <-- NEW COLUMN */}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urlDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium max-w-md truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={doc.file_path}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                          >
                            {doc.file_name || doc.file_path}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          {doc.file_name || doc.file_path}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {editingTags[doc.id] ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempTags[doc.id] || ""}
                            onChange={(e) =>
                              setTempTags((prev) => ({
                                ...prev,
                                [doc.id]: e.target.value,
                              }))
                            }
                            disabled={tagUpdateLoading[doc.id]}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveTags(doc.id)}
                            disabled={tagUpdateLoading[doc.id]}
                          >
                            {tagUpdateLoading[doc.id] ? (
                              <IconLoader className="w-4 h-4 animate-spin" />
                            ) : (
                              <IconCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelEdit(doc.id)}
                            disabled={tagUpdateLoading[doc.id]}
                          >
                            <IconX className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {doc.document_tags?.length ? (
                              doc.document_tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No tags
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleEditTags(doc.id, doc.document_tags)
                            }
                          >
                            <IconEdit className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doc.purpose === DocumentPurpose.KNOWLEDGE_BASE
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {doc.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doc.status === "COMPLETED" ? "default" : "outline"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <IconTrash className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
