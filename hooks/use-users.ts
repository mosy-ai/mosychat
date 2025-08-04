import { useState, useEffect, useCallback } from "react";
import { apiClient, UserResponse } from "@/lib/api-client";

export function useUsers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const listUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.users.list();
      setUsers(res.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listUsers();
  }, [listUsers]);

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.users.delete(userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (e: any) {
      setError(e.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserResponse) => {
    setEditingUser(user);
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
  };

  const handleUserUpdateSuccess = () => {
    listUsers();
    handleCloseEditDialog();
  };

  const handleUserCreateSuccess = () => {
    listUsers();
    setIsAddDialogOpen(false);
  };

  return {
    users,
    loading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingUser,
    handleDeleteUser,
    handleEditUser,
    handleCloseEditDialog,
    handleUserUpdateSuccess,
    handleUserCreateSuccess,
  };
} 