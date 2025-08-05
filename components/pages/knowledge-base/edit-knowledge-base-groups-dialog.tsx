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
import { apiClient, KnowledgeBase, GroupResponse } from "@/lib/api-client";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface EditDialogProps extends DialogProps {
  kb: KnowledgeBase;
}

export function EditKnowledgeBaseGroupsDialog({ kb, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchGroups = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.groups.list();
          setGroups(response.data || []);
          // Initialize with current groups (you might need to fetch current groups for this KB)
          setSelectedGroupIds([]); // This should be populated with current groups
        } catch (err: any) {
          console.error("Failed to fetch groups:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGroups();
    }
  }, [open]);

  const handleCheckboxChange = (groupId: string, checked: boolean) => {
    setSelectedGroupIds(prev => 
      checked 
        ? [...prev, groupId]
        : prev.filter(id => id !== groupId)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update knowledge base groups
      await apiClient.knowledgeBases.update(
        kb.id,
        {
          group_ids: selectedGroupIds,
        }
      )
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      alert(err.message || "Failed to update groups.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Groups for {kb.name}</DialogTitle>
          <DialogDescription>
            Select groups who should have access to this knowledge base.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="text-center py-8">Loading groups...</div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={group.id}
                    checked={selectedGroupIds.includes(group.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(group.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={group.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {group.name}
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