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
import { apiClient, AgentResponse } from "@/lib/api-client";
import { EditAgentDetailsDialogProps } from "./types";

export function EditAgentDetailsDialog({ agent, open, onOpenChange, onSuccess }: EditAgentDetailsDialogProps) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.agents.update(agent.id, { name, description });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Agent Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agent Name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agent Description"
            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
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