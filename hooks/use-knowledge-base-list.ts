import { useState, useEffect, useCallback } from "react";
import { apiClient, KnowledgeBase } from "@/lib/api-client";

export function useKnowledgeBaseList() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingKBDetails, setEditingKBDetails] = useState<KnowledgeBase | null>(null);
  const [editingKBUsers, setEditingKBUsers] = useState<KnowledgeBase | null>(null);
  const [editingKBGroups, setEditingKBGroups] = useState<KnowledgeBase | null>(null);

  const listKnowledgeBases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.knowledgeBases.list();
      setKnowledgeBases(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch knowledge bases.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    listKnowledgeBases();
  }, [listKnowledgeBases]);

  const handleDeleteKB = async (kbId: string) => {
    if (window.confirm("Are you sure you want to delete this knowledge base? This action cannot be undone.")) {
      try {
        await apiClient.knowledgeBases.delete(kbId);
        await listKnowledgeBases();
      } catch (err: any) {
        alert(err.message || "Failed to delete knowledge base.");
      }
    }
  };

  return {
    knowledgeBases,
    isLoading,
    error,
    isAddDialogOpen,
    editingKBDetails,
    editingKBUsers,
    editingKBGroups,
    setIsAddDialogOpen,
    setEditingKBDetails,
    setEditingKBUsers,
    setEditingKBGroups,
    listKnowledgeBases,
    handleDeleteKB,
  };
} 