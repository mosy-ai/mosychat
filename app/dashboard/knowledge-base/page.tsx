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
  IconUsersGroup,
  IconTrash,
  IconPlus,
  IconLoader,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  apiClient,
  KnowledgeBase,
  UserResponse,
  GroupResponse, // <-- ADDED: Import GroupResponse
} from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useAuth } from "@/components/vietrux-ui/layout-context-provider";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  // State for the main page
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to control which dialog is open and for which KB
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingKBDetails, setEditingKBDetails] = useState<KnowledgeBase | null>(null);
  const [editingKBUsers, setEditingKBUsers] = useState<KnowledgeBase | null>(null);
  const [editingKBGroups, setEditingKBGroups] = useState<KnowledgeBase | null>(null); // <-- ADDED

  
  // Callback to fetch/refresh the list of KBs
  const listKnowledgeBases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.listKnowledgeBases();
      setKnowledgeBases(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch knowledge bases.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    listKnowledgeBases();
  }, [listKnowledgeBases]);

  // Handler for deleting a KB
  const handleDeleteKB = async (kbId: string) => {
    if (window.confirm("Are you sure you want to delete this knowledge base? This action cannot be undone.")) {
      try {
        await apiClient.deleteKnowledgeBase(kbId);
        await listKnowledgeBases(); // Refresh the list
      } catch (err: any) {
        alert(err.message || "Failed to delete knowledge base.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <IconLoader className="h-8 w-8 animate-spin text-primary mb-4" />
        Loading Knowledge Bases...
      </div>
    );
  }

  if (error) {
    return <div className="p-6"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Knowledge Base
        </h1>
        <Separator />
        <div className="flex justify-end">
          <Button variant="default" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Knowledge Base
          </Button>
        </div>
        <Table>
          <TableCaption>A list of your knowledge bases. Found {knowledgeBases.length}.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Functions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {knowledgeBases.map((kb) => (
              <TableRow key={kb.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/knowledge-base/${kb.id}`}
                    className="hover:underline"
                  >
                    {kb.name}
                  </Link>
                </TableCell>
                <TableCell>{kb.users?.length ?? 0}</TableCell>
                <TableCell>{kb.groups?.length ?? 0}</TableCell>
                <TableCell>{kb.document_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  {user?.role === "ADMIN" ? (
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingKBDetails(kb)}><IconPencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingKBUsers(kb)}><IconUsers className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingKBGroups(kb)}>
                      <IconUsersGroup className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteKB(kb.id)}><IconTrash className="w-4 h-4 text-red-500" /></Button>
                  </div>
                  ) : (
                    <Link href={`/dashboard/knowledge-base/${kb.id}`}>
                      <IconPencil className="w-4 h-4" />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddKnowledgeBaseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          listKnowledgeBases();
        }}
      />

      {editingKBDetails && (
        <EditKnowledgeBaseNameDialog
          key={editingKBDetails.id}
          kb={editingKBDetails}
          open={!!editingKBDetails}
          onOpenChange={(isOpen) => !isOpen && setEditingKBDetails(null)}
          onSuccess={() => {
            setEditingKBDetails(null);
            listKnowledgeBases();
          }}
        />
      )}

      {editingKBUsers && (
        <EditKnowledgeBaseUsersDialog
          key={editingKBUsers.id}
          kb={editingKBUsers}
          open={!!editingKBUsers}
          onOpenChange={(isOpen) => !isOpen && setEditingKBUsers(null)}
          onSuccess={() => {
            setEditingKBUsers(null);
            listKnowledgeBases();
          }}
        />
      )}

      {editingKBGroups && (
        <EditKnowledgeBaseGroupsDialog
          key={editingKBGroups.id}
          kb={editingKBGroups}
          open={!!editingKBGroups}
          onOpenChange={(isOpen) => !isOpen && setEditingKBGroups(null)}
          onSuccess={() => {
            setEditingKBGroups(null);
            listKnowledgeBases();
          }}
        />
      )}
    </>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// ... (AddKnowledgeBaseDialog and EditKnowledgeBaseNameDialog remain unchanged)
function AddKnowledgeBaseDialog({ open, onOpenChange, onSuccess }: DialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.createKnowledgeBase({ name });
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
          <DialogTitle>Create New Knowledge Base</DialogTitle>
          <DialogDescription>Create a space to store your documents and articles.</DialogDescription>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Knowledge Base Name" className="my-4" />
        <Button onClick={handleCreate} disabled={!name.trim() || isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create"}
        </Button>
        {error && <Alert variant="destructive" className="mt-2"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

function EditKnowledgeBaseNameDialog({ kb, open, onOpenChange, onSuccess }: { kb: KnowledgeBase } & DialogProps) {
  const [name, setName] = useState(kb.name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.updateKnowledgeBase(kb.id, { name });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update name.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Knowledge Base Name</DialogTitle>
          <DialogDescription>Change the name of '{kb.name}'.</DialogDescription>
        </DialogHeader>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New Knowledge Base Name" className="my-4" />
        <Button onClick={handleSave} disabled={!name.trim() || name === kb.name || isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {error && <Alert variant="destructive" className="mt-2"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}


// ... (EditKnowledgeBaseUsersDialog remains unchanged)
function EditKnowledgeBaseUsersDialog({ kb, open, onOpenChange, onSuccess }: { kb: KnowledgeBase } & DialogProps) {
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set(kb.user_ids || []));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient.listUsers({ size: 1000 });
          setAllUsers(response.data || []);
        } catch (err: any) {
          setError(err.message || "Failed to load users.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open]);

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedUserIds);
    if (checked) newSelectedIds.add(userId);
    else newSelectedIds.delete(userId);
    setSelectedUserIds(newSelectedIds);
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.updateKnowledgeBase(kb.id, { user_ids: Array.from(selectedUserIds) });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update users.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Users for '{kb.name}'</DialogTitle>
          <DialogDescription>Select users who can access this knowledge base.</DialogDescription>
        </DialogHeader>
        <div className="h-[320px] overflow-y-auto border rounded-md relative mt-4">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSubmitting} className="w-full mt-4">
          {isSubmitting ? "Saving..." : "Update Users"}
        </Button>
        {error && <Alert variant="destructive" className="mt-2"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

// --- ADDED: New Dialog component for managing groups ---
function EditKnowledgeBaseGroupsDialog({ kb, open, onOpenChange, onSuccess }: { kb: KnowledgeBase } & DialogProps) {
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set(kb.group_ids || []));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazy-load all groups when the dialog opens
  useEffect(() => {
    if (open) {
      const fetchGroups = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient.listGroups({ limit: 1000 }); // Use listGroups
          setAllGroups(response.data || []);
        } catch (err: any) {
          setError(err.message || "Failed to load groups.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchGroups();
    }
  }, [open]);

  const handleCheckboxChange = (groupId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedGroupIds);
    if (checked) newSelectedIds.add(groupId);
    else newSelectedIds.delete(groupId);
    setSelectedGroupIds(newSelectedIds);
  };

  const handleSave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Call updateKnowledgeBase with the new group_ids
      await apiClient.updateKnowledgeBase(kb.id, { group_ids: Array.from(selectedGroupIds) });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update groups.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Groups for '{kb.name}'</DialogTitle>
          <DialogDescription>Select groups that can access this knowledge base.</DialogDescription>
        </DialogHeader>
        <div className="h-[320px] overflow-y-auto border rounded-md relative mt-4">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <IconLoader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading groups...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroupIds.has(group.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(group.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSubmitting} className="w-full mt-4">
          {isSubmitting ? "Saving..." : "Update Groups"}
        </Button>
        {error && <Alert variant="destructive" className="mt-2"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}