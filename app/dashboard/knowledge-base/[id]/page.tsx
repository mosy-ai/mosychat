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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  apiClient,
  Document,
  KnowledgeBase,
  DocumentPurpose,
} from "@/lib/api-client";

interface StagedUploadItem {
  id: string;
  type: "FILE" | "URL";
  source: File | string;
  description: string;
  tags: string;
  purpose: DocumentPurpose;
}

interface PendingUpload {
  id: string;
  type: "FILE" | "URL";
  name: string;
  purpose: DocumentPurpose;
  size?: number;
  status: "UPLOADING" | "ERROR";
  errorMessage?: string;
}

export default function KnowledgeBaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const kbId = params.id;

  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editingTags, setEditingTags] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [tempTags, setTempTags] = useState<{ [key: string]: string }>({});
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [stagedItems, setStagedItems] = useState<StagedUploadItem[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [tagUpdateLoading, setTagUpdateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [pageError, setPageError] = useState<string | null>(null);

  const isUploading = useMemo(
    () => pendingUploads.length > 0,
    [pendingUploads]
  );

  const loadData = async () => {
    setPageError(null);
    try {
      const kbResponse = await apiClient.knowledgeBases.get(kbId);
      if (kbResponse.status_code !== 200) {
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
      setIsPageLoading(true);
      loadData();
    }
  }, [kbId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newStagedFiles: StagedUploadItem[] = Array.from(files).map(
      (file) => ({
        id: `${file.name}-${Date.now()}`,
        type: "FILE",
        source: file,
        description: "",
        tags: "",
        purpose: DocumentPurpose.KNOWLEDGE_BASE,
      })
    );

    setStagedItems((prev) => [...prev, ...newStagedFiles]);
    setIsUploadModalOpen(true);
    event.target.value = "";
  };

  const handleAddUrlClick = () => {
    const newStagedUrl: StagedUploadItem = {
      id: `url-${Date.now()}`,
      type: "URL",
      source: "",
      description: "",
      tags: "",
      purpose: DocumentPurpose.KNOWLEDGE_BASE,
    };
    setStagedItems((prev) => [...prev, newStagedUrl]);
    setIsUploadModalOpen(true);
  };

  const handleStagedItemChange = (
    id: string,
    field: keyof StagedUploadItem,
    value: string | DocumentPurpose
  ) => {
    setStagedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (!isUploadModalOpen) {
      setStagedItems([]);
    }
  }, [isUploadModalOpen]);

  const handleStartUploads = () => {
    const itemsToUpload = [...stagedItems];
    setIsUploadModalOpen(false);
    setStagedItems([]);

    itemsToUpload.forEach((item) => {
      const pendingUpload: PendingUpload = {
        id: item.id,
        type: item.type,
        name:
          item.type === "FILE"
            ? (item.source as File).name
            : (item.source as string),
        purpose: item.purpose,
        size: item.type === "FILE" ? (item.source as File).size : undefined,
        status: "UPLOADING",
      };
      setPendingUploads((prev) => [...prev, pendingUpload]);

      const tagsArray = (item.tags || "")
        .split(/,|\s+/)
        .map((tag) => tag.trim())
        .filter(Boolean);
      const documentDto = JSON.stringify({
        knowledge_base_id: kbId,
        purpose: item.purpose,
        description: item.description.trim() || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        ...(item.type === "URL" && { url: item.source }),
      });

      apiClient.documents
        .create({
          document_dto: documentDto,
          file: item.type === "FILE" ? (item.source as File) : undefined,
          file_upload_type: item.type,
        })
        .then((response) => {
          setDocuments((prev) => [...prev, response.data]);
          setPendingUploads((prev) => prev.filter((p) => p.id !== item.id));
        })
        .catch((error) => {
          console.error(`Failed to upload ${item.type}:`, error);
          setPendingUploads((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, status: "ERROR", errorMessage: `Upload failed` }
                : p
            )
          );
        });
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    )
      return;
    try {
      await apiClient.documents.delete(docId);
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
      await apiClient.documents.update(docId, {
        tags: tagsArray.length > 0 ? tagsArray : null,
      });
      await loadData();
      setEditingTags((prev) => ({ ...prev, [docId]: false }));
    } catch (error) {
      console.error("Error updating tags:", error);
      alert("Failed to update tags.");
    } finally {
      setTagUpdateLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (bytes === undefined || bytes === 0) return "0 Bytes";
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
  const pendingFileDocuments = useMemo(
    () => pendingUploads.filter((p) => p.type === "FILE"),
    [pendingUploads]
  );
  const pendingUrlDocuments = useMemo(
    () => pendingUploads.filter((p) => p.type === "URL"),
    [pendingUploads]
  );

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <IconLoader className="animate-spin text-primary" size={48} />
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

  return (
    <TooltipProvider>
      <div className="flex flex-col p-4 md:gap-6 md:p-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <IconArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="scroll-m-20 text-3xl font-bold tracking-tight">
              {kb?.name}
            </h1>
            <span className="italic font-light text-sm text-muted-foreground">
              ID: {kbId}
            </span>
          </div>
        </div>
        <Separator />

        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Prepare Documents for Upload</DialogTitle>
              <DialogDescription>
                Add files or URLs. You can edit tags and descriptions for each
                item before uploading.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] p-4 border rounded-md">
              <div className="grid gap-6">
                {stagedItems.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-8">
                    Select files or add a URL to get started.
                  </p>
                )}
                {stagedItems.map((item) => (
                  <Card key={item.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleRemoveStagedItem(item.id)}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                    <CardHeader>
                      <CardTitle className="text-lg pr-8 truncate">
                        {item.type === "FILE"
                          ? (item.source as File).name
                          : "URL Details"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      {item.type === "URL" && (
                        <div className="grid gap-2">
                          <Label htmlFor={`url-${item.id}`}>URL</Label>
                          <Input
                            id={`url-${item.id}`}
                            value={item.source as string}
                            onChange={(e) =>
                              handleStagedItemChange(
                                item.id,
                                "source",
                                e.target.value
                              )
                            }
                            placeholder="https://example.com/article"
                          />
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label htmlFor={`desc-${item.id}`}>
                          Description (optional)
                        </Label>
                        <Textarea
                          id={`desc-${item.id}`}
                          value={item.description}
                          onChange={(e) =>
                            handleStagedItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="min-h-[80px]"
                          placeholder="A brief summary of the content."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`tags-${item.id}`}>
                          Tags (comma-separated)
                        </Label>
                        <Input
                          id={`tags-${item.id}`}
                          value={item.tags}
                          onChange={(e) =>
                            handleStagedItemChange(
                              item.id,
                              "tags",
                              e.target.value
                            )
                          }
                          placeholder="e.g. policy, onboarding, v2"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`purpose-${item.id}`}>Purpose</Label>
                        <Select
                          value={item.purpose}
                          onValueChange={(value: DocumentPurpose) =>
                            handleStagedItemChange(item.id, "purpose", value)
                          }
                        >
                          <SelectTrigger id={`purpose-${item.id}`}>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DocumentPurpose.KNOWLEDGE_BASE}>
                              Knowledge Base
                            </SelectItem>
                            <SelectItem value={DocumentPurpose.ATTACHMENT}>
                              Attachment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartUploads}
                disabled={
                  stagedItems.length === 0 ||
                  stagedItems.some((i) => i.type === "URL" && !i.source)
                }
              >
                {isUploading
                  ? "Processing..."
                  : `Confirm & Upload ${stagedItems.length} Item(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="file">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Files</TabsTrigger>
            <TabsTrigger value="url">URLs</TabsTrigger>
          </TabsList>

          <TabsContent
            value="file"
            className="flex flex-col gap-4 md:gap-6 mt-4"
          >
            <div className="flex justify-end">
              <div className="relative">
                <Button asChild variant="default" disabled={isUploading}>
                  <label htmlFor="file-upload">
                    {isUploading ? (
                      <>
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" /> In
                        Progress...
                      </>
                    ) : (
                      "Upload Files"
                    )}
                  </label>
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </div>
            </div>
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
                {pendingFileDocuments.map((upload) => (
                  <TableRow key={upload.id} className="opacity-60">
                    <TableCell className="font-medium max-w-xs truncate">
                      {upload.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.purpose}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(upload.size)}</TableCell>
                    <TableCell>
                      {upload.status === "UPLOADING" ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <IconLoader className="w-3 h-3 animate-spin" />
                          Uploading
                        </Badge>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="destructive">Error</Badge>
                          </TooltipTrigger>
                          <TooltipContent>{upload.errorMessage}</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" disabled>
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-blue-500 text-white dark:bg-blue-600"
                                >
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
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={handleAddUrlClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" /> In
                    Progress...
                  </>
                ) : (
                  "Add URL"
                )}
              </Button>
            </div>
            <Table>
              <TableCaption>A list of your submitted URLs.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>URL / File Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUrlDocuments.map((upload) => (
                  <TableRow key={upload.id} className="opacity-60">
                    <TableCell className="font-medium max-w-md truncate">
                      {upload.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">—</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{upload.purpose}</Badge>
                    </TableCell>
                    <TableCell>
                      {upload.status === "UPLOADING" ? (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <IconLoader className="w-3 h-3 animate-spin" />
                          Processing
                        </Badge>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="destructive">Error</Badge>
                          </TooltipTrigger>
                          <TooltipContent>{upload.errorMessage}</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" disabled>
                        <IconTrash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {urlDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium max-w-md truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {doc.file_name || doc.file_path}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{doc.file_path}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="max-w-xs text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger>
                          {doc.description
                            ? doc.description.length > 100
                              ? `${doc.description.slice(0, 100)}...`
                              : doc.description
                            : "—"}
                        </TooltipTrigger>
                        {doc.description && (
                          <TooltipContent className="max-w-md">
                            <p>{doc.description}</p>
                          </TooltipContent>
                        )}
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
