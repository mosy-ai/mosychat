import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconExclamationCircle } from "@tabler/icons-react";
import { apiClient } from "@/lib/api-client";
import { AddGroupDialogProps } from "./types";

export function AddGroupDialog({ open, onOpenChange, onSuccess }: AddGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.groups.create({ name, description });
      onSuccess();
      // Reset form
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setDescription("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group</DialogTitle>
          <DialogDescription>Create a new group</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group Name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group Description (optional)"
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!name.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
        {error && (
          <Alert variant="destructive">
            <IconExclamationCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 