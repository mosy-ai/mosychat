"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPencil,
  IconUsers,
  IconTrash,
  IconPlus,
  IconExclamationCircle,
  IconCircleCheck,
  IconLoader,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Import the apiClient and relevant types
// Make sure this path is correct for your project structure
import { apiClient, GroupResponse, UserResponse } from "@/lib/api-client";

export default function GroupsPage() {
  // State for the main page
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to control which dialog is open
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponse | null>(null); // For editing name/description
  const [editingUsersForGroup, setEditingUsersForGroup] = useState<GroupResponse | null>(null); // For editing users

  // Callback function to fetch/refresh the list of groups
  const listGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.listGroups();
      setGroups(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch groups.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch of groups when the component mounts
  useEffect(() => {
    listGroups();
  }, [listGroups]);

  // Handler for deleting a group
  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await apiClient.deleteGroup(groupId);
        // Refresh the list after successful deletion
        await listGroups();
      } catch (err: any) {
        alert(err.message || "Failed to delete group.");
        console.error(err);
      }
    }
  };
  
  // Main page loading and error states
  if (isLoading) {
    return <div className="p-6">Loading groups...</div>;
  }
  
  if (error) {
    return <div className="p-6"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Groups
        </h1>
        <Separator />
        <div className="flex justify-end">
          <Button variant="default" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
        <Table>
          <TableCaption>A list of groups. Found {groups.length} groups.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User Count</TableHead>
              <TableHead className="text-right">Functions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.user_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingGroup(group)}>
                      <IconPencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingUsersForGroup(group)}>
                      <IconUsers className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <IconTrash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- Dialogs --- */}
      {/* These are now rendered conditionally outside the main table map for better performance */}

      <AddGroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          listGroups();
        }}
      />

      {editingGroup && (
        <EditGroupNameDialog
          key={editingGroup.id} // Add key to force re-mount when group changes
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(isOpen) => !isOpen && setEditingGroup(null)}
          onSuccess={() => {
            setEditingGroup(null);
            listGroups();
          }}
        />
      )}

      {editingUsersForGroup && (
        <EditGroupUsersDialog
          key={editingUsersForGroup.id} // Add key to force re-mount
          group={editingUsersForGroup}
          open={!!editingUsersForGroup}
          onOpenChange={(isOpen) => !isOpen && setEditingUsersForGroup(null)}
          onSuccess={() => {
            setEditingUsersForGroup(null);
            listGroups();
          }}
        />
      )}
    </>
  );
}

// --- Dialog Components ---

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function AddGroupDialog({ open, onOpenChange, onSuccess }: DialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.createGroup({ name, description });
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
          <DialogTitle>Add Group</DialogTitle>
          <DialogDescription>Create a new group</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group Name"/>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Group Description (optional)"/>
        </div>
        <Button onClick={handleAdd} disabled={!name.trim() || isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Group"}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

function EditGroupNameDialog({ group, open, onOpenChange, onSuccess }: { group: GroupResponse } & DialogProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.updateGroup(group.id, { name, description });
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group Name" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Group Description (optional)"/>
        </div>
        <Button onClick={handleUpdate} disabled={!name.trim() || !isChanged || isSubmitting} className="w-full">
          {isSubmitting ? "Updating..." : "Update Group"}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

function EditGroupUsersDialog({ group, open, onOpenChange, onSuccess }: { group: GroupResponse } & DialogProps) {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(group.user_ids || []));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // *** LAZY LOADING IMPLEMENTATION ***
  // This effect runs only when the dialog is opened.
  useEffect(() => {
    // Only fetch if the dialog is open and users haven't been loaded yet.
    if (open) {
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch a large number of users; consider adding pagination if you have thousands.
          const response = await apiClient.listUsers({ size: 1000 });
          setAllUsers(response.data || []);
        } catch (err: any) {
          setError(err.message || "Failed to fetch users.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]); // Dependency array ensures this runs only when `open` changes.

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
      await apiClient.updateGroup(group.id, { user_ids: Array.from(selectedUserIds) });
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
        <Button onClick={handleUpdate} disabled={isSubmitting || isLoading} className="w-full">
          {isSubmitting ? "Updating..." : "Update Users"}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}