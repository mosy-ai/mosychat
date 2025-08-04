import { useState, useEffect, useCallback } from "react";
import { apiClient, GroupResponse } from "@/lib/api-client";

export function useGroups() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupResponse | null>(null);
  const [editingUsersForGroup, setEditingUsersForGroup] = useState<GroupResponse | null>(null);

  const listGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.groups.list();
      setGroups(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch groups.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    listGroups();
  }, [listGroups]);

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await apiClient.groups.delete(groupId);
        await listGroups();
      } catch (err: any) {
        alert(err.message || "Failed to delete group.");
        console.error(err);
      }
    }
  };

  const handleEditGroup = (group: GroupResponse) => {
    setEditingGroup(group);
  };

  const handleEditUsers = (group: GroupResponse) => {
    setEditingUsersForGroup(group);
  };

  const handleCloseEditDialog = () => {
    setEditingGroup(null);
  };

  const handleCloseEditUsersDialog = () => {
    setEditingUsersForGroup(null);
  };

  const handleGroupUpdateSuccess = () => {
    listGroups();
    handleCloseEditDialog();
  };

  const handleGroupCreateSuccess = () => {
    listGroups();
    setIsAddDialogOpen(false);
  };

  const handleGroupUsersUpdateSuccess = () => {
    listGroups();
    handleCloseEditUsersDialog();
  };

  return {
    groups,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingGroup,
    editingUsersForGroup,
    handleDeleteGroup,
    handleEditGroup,
    handleEditUsers,
    handleCloseEditDialog,
    handleCloseEditUsersDialog,
    handleGroupUpdateSuccess,
    handleGroupCreateSuccess,
    handleGroupUsersUpdateSuccess,
  };
} 