import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconExclamationCircle, IconLoader } from "@tabler/icons-react";
import { apiClient, GroupResponse, UserResponse } from "@/lib/api-client";
import { EditGroupUsersDialogProps } from "./types";

export function EditGroupUsersDialog({ group, open, onOpenChange, onSuccess }: EditGroupUsersDialogProps) {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(group.user_ids || []));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lazy loading implementation
  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient.users.list({ size: 1000 });
          setAllUsers(response.data || []);
        } catch (err: any) {
          setError(err.message || "Failed to fetch users.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]);

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    const newSelectedUserIds = new Set(selectedUserIds);
    if (checked) newSelectedUserIds.add(userId);
    else newSelectedUserIds.delete(userId);
    setSelectedUserIds(newSelectedUserIds);
  };

  const handleUpdate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.groups.update(group.id, { user_ids: Array.from(selectedUserIds) });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update group users.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Users for '{group.name}'</DialogTitle>
          <DialogDescription>Select users to be part of this group.</DialogDescription>
        </DialogHeader>
        <div className="h-[320px] overflow-y-auto border rounded-md relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <IconLoader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(user.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">{user.role || "User"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Button
          onClick={handleUpdate}
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting ? "Updating..." : "Update Users"}
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