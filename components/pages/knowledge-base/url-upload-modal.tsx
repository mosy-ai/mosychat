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
import { IconX, IconLink, IconGlobe, IconPlus } from "@tabler/icons-react";
import { DocumentPurpose } from "@/lib/api-client";
import { UrlUploadModalProps } from "./types";
import { TagInput } from "./tag-input";

export function UrlUploadModal({
  isOpen,
  onOpenChange,
  stagedUrls,
  onStagedItemChange,
  onRemoveStagedItem,
  onStartUrlUploads,
  onAddUrl,
  isUploading,
  allTags,
  getTagSuggestions,
  isLoadingTags,
  tagLoadError,
}: UrlUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconGlobe className="h-5 w-5" />
            Chuẩn bị URLs để tải lên
          </DialogTitle>
          <DialogDescription>
            Thêm URLs và cấu hình thông tin cho từng cái. Bạn có thể chỉnh sửa thẻ và mô tả cho từng URL.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] p-4 border rounded-md">
          <div className="grid gap-6">
            {stagedUrls.length === 0 && (
              <div className="text-center py-8">
                <IconLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Chưa có URL nào được thêm. Nhấp "Thêm URL" để bắt đầu.
                </p>
              </div>
            )}
            {stagedUrls.map((item) => {
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
                      <IconLink className="h-4 w-4" />
                      <span>Chi tiết URL</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`url-${item.id}`}>URL</Label>
                      <Input
                        id={`url-${item.id}`}
                        value={item.source as string}
                        onChange={(e) =>
                          onStagedItemChange(item.id, "source", e.target.value)
                        }
                        placeholder="https://example.com/article"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`desc-${item.id}`}>
                        Mô tả (tùy chọn)
                      </Label>
                      <Textarea
                        id={`desc-${item.id}`}
                        value={item.description}
                        onChange={(e) =>
                          onStagedItemChange(item.id, "description", e.target.value)
                        }
                        className="min-h-[80px]"
                        placeholder="Tóm tắt ngắn gọn về nội dung tại URL này."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`tags-${item.id}`}>
                        Thẻ (gõ và nhấn khoảng trắng để tạo thẻ)
                      </Label>
                      <TagInput
                        value={item.tags}
                        onChange={(value) => onStagedItemChange(item.id, "tags", value)}
                        suggestions={suggestions}
                        placeholder="Gõ thẻ và nhấn khoảng trắng..."
                        disabled={isUploading}
                        isLoadingTags={isLoadingTags}
                        tagLoadError={tagLoadError}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`purpose-${item.id}`}>Mục đích</Label>
                      <Select
                        value={item.purpose}
                        onValueChange={(value: DocumentPurpose) =>
                          onStagedItemChange(item.id, "purpose", value)
                        }
                      >
                        <SelectTrigger id={`purpose-${item.id}`}>
                          <SelectValue placeholder="Chọn mục đích" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DocumentPurpose.KNOWLEDGE_BASE}>
                            Cơ sở tri thức
                          </SelectItem>
                          <SelectItem value={DocumentPurpose.ATTACHMENT}>
Đính kèm
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
        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onAddUrl}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            Thêm URL khác
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button
              onClick={onStartUrlUploads}
              disabled={
                stagedUrls.length === 0 ||
                stagedUrls.some((i) => !i.source) ||
                isUploading
              }
            >
              {isUploading
                ? "Đang xử lý URLs..."
                : `Thêm ${stagedUrls.length} URL`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 