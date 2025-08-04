import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconX, IconFile, IconUpload } from "@tabler/icons-react";
import { DocumentPurpose } from "@/lib/api-client";
import { FileUploadModalProps } from "./types";
import { TagInput } from "./tag-input";

export function FileUploadModal({
  isOpen,
  onOpenChange,
  stagedFiles,
  onStagedItemChange,
  onRemoveStagedItem,
  onStartFileUploads,
  isUploading,
  allTags,
  getTagSuggestions,
  isLoadingTags,
  tagLoadError,
}: FileUploadModalProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUpload className="h-5 w-5" />
            Prepare Files for Upload
          </DialogTitle>
          <DialogDescription>
            Configure metadata for each file before uploading. You can edit tags and descriptions for each file.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
          <div className="grid gap-6">
            {stagedFiles.length === 0 && (
              <div className="text-center py-8">
                <IconFile className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No files selected. Please select files to upload.
                </p>
              </div>
            )}
            {stagedFiles.map((item) => {
              const currentTags = item.tags
                .split(",")
                .map(tag => tag.trim())
                .filter(Boolean);
              
              const suggestions = getTagSuggestions("", currentTags);

              return (
                <Card key={item.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => onRemoveStagedItem(item.id)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <CardTitle className="text-lg pr-8 flex items-center gap-2">
                      <IconFile className="h-4 w-4" />
                      <span className="truncate">
                        {(item.source as File).name}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Size: {formatFileSize((item.source as File).size)}
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`desc-${item.id}`}>
                        Description (optional)
                      </Label>
                      <Textarea
                        id={`desc-${item.id}`}
                        value={item.description}
                        onChange={(e) =>
                          onStagedItemChange(item.id, "description", e.target.value)
                        }
                        className="min-h-[80px]"
                        placeholder="A brief summary of the file content."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`tags-${item.id}`}>
                        Tags (type and press space to create badges)
                      </Label>
                      <TagInput
                        value={item.tags}
                        onChange={(value) => onStagedItemChange(item.id, "tags", value)}
                        suggestions={suggestions}
                        placeholder="Type tags and press space..."
                        disabled={isUploading}
                        isLoadingTags={isLoadingTags}
                        tagLoadError={tagLoadError}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`purpose-${item.id}`}>Purpose</Label>
                      <Select
                        value={item.purpose}
                        onValueChange={(value: DocumentPurpose) =>
                          onStagedItemChange(item.id, "purpose", value)
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
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onStartFileUploads}
            disabled={stagedFiles.length === 0 || isUploading}
          >
            {isUploading
              ? "Uploading Files..."
              : `Upload ${stagedFiles.length} File${stagedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 