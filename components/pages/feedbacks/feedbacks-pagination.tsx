import { Button } from "@/components/ui/button";
import { FeedbacksPaginationProps } from "./types";

export function FeedbacksPagination({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  canPreviousPage,
  canNextPage,
}: FeedbacksPaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 