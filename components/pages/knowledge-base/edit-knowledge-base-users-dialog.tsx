import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient, KnowledgeBase, UserResponse } from "@/lib/api-client";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EditDialogProps extends DialogProps {
  kb: KnowledgeBase;
}

export function EditKnowledgeBaseUsersDialog({ kb, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.users.list();
          setUsers(response.data || []);
          // Initialize with current users (you might need to fetch current users for this KB)
          setSelectedUserIds([]); // This should be populated with current users
        } catch (err: any) {
          console.error("Failed to fetch users:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]);

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update knowledge base users
      await apiClient.knowledgeBases.update(
        kb.id,
        {
          user_ids: selectedUserIds,
        }
      );
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || "Failed to update users.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Users for {kb.name}</DialogTitle>
          <DialogDescription>
            Select users who should have access to this knowledge base.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={user.id}
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(user.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={user.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {user.email}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 