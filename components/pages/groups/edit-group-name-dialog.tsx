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
import { apiClient, GroupResponse } from "@/lib/api-client";
import { EditGroupNameDialogProps } from "./types";

export function EditGroupNameDialog({ group, open, onOpenChange, onSuccess }: EditGroupNameDialogProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.groups.update(group.id, { name, description });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChanged = name !== group.name || description !== group.description;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group Details</DialogTitle>
          <DialogDescription>Update the name and description for '{group.name}'.</DialogDescription>
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
          onClick={handleUpdate}
          disabled={!name.trim() || !isChanged || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Updating..." : "Update Group"}
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