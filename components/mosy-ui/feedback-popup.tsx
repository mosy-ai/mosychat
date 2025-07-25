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
            {feedbackType === "positive" ? "👍 Positive" : "👎 Negative"} Feedback
          </DialogTitle>
          <DialogDescription>
            {feedbackType === "positive"
              ? "What did you like about this response?"
              : "What could be improved about this response?"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="comment">
              Comment {feedbackType === "negative" ? "(Required)" : "(Optional)"}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedbackType === "positive"
                  ? "Tell us what you liked..."
                  : "Tell us how we can improve..."
              }
              className="resize-none"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (feedbackType === "negative" && comment.trim() === "")
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};