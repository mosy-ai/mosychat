import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  feedbackType: "positive" | "negative";
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  feedbackType,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {feedbackType === "positive" ? "👍 Tích cực" : "👎 Tiêu cực"} Phản hồi
          </DialogTitle>
          <DialogDescription>
            {feedbackType === "positive"
              ? "Bạn thích điều gì về phản hồi này?"
              : "Điều gì có thể được cải thiện trong phản hồi này?"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="comment">
              Bình luận {feedbackType === "negative" ? "(Bắt buộc)" : "(Tùy chọn)"}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedbackType === "positive"
                  ? "Hãy cho chúng tôi biết bạn thích điều gì..."
                  : "Hãy cho chúng tôi biết cách chúng tôi có thể cải thiện..."
              }
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (feedbackType === "negative" && comment.trim() === "")
            }
          >
            {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};