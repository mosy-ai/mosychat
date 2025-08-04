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
import { IconX, IconCheck } from "@tabler/icons-react";
import { DocumentPurpose } from "@/lib/api-client";
import { UploadModalProps } from "./types";

export function UploadModal({
  isOpen,
  onOpenChange,
  stagedItems,
  onStagedItemChange,
  onRemoveStagedItem,
  onStartUploads,
  isUploading,
}: UploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Prepare Documents for Upload</DialogTitle>
          <DialogDescription>
            Add files or URLs. You can edit tags and descriptions for each item
            before uploading.
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
                  onClick={() => onRemoveStagedItem(item.id)}
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
                          onStagedItemChange(item.id, "source", e.target.value)
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
                        onStagedItemChange(item.id, "description", e.target.value)
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
                        onStagedItemChange(item.id, "tags", e.target.value)
                      }
                      placeholder="e.g. policy, onboarding, v2"
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
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onStartUploads}
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
  );
} 