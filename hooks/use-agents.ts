import { useState, useEffect, useCallback } from "react";
import { apiClient, AgentResponse } from "@/lib/api-client";

export function useAgents() {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAgentDetails, setEditingAgentDetails] = useState<AgentResponse | null>(null);
  const [editingAgentUsers, setEditingAgentUsers] = useState<AgentResponse | null>(null);
  const [editingAgentGroups, setEditingAgentGroups] = useState<AgentResponse | null>(null);
  const [editingAgentKBs, setEditingAgentKBs] = useState<AgentResponse | null>(null);

  const listAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.agents.list();
      setAgents(response.data.map(agent => ({ 
        ...agent, 
        user_count: agent.users?.length || 0, 
        group_count: agent.groups?.length || 0, 
        knowledge_base_count: agent.knowledge_base_count || 0 
      })) || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch agents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    listAgents();
  }, [listAgents]);

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await apiClient.agents.delete(agentId);
        await listAgents();
      } catch (err: any) {
        alert(err.message || "Failed to delete agent.");
      }
    }
  };

  const handleEditAgent = (agent: AgentResponse) => {
    setEditingAgentDetails(agent);
  };

  const handleEditUsers = (agent: AgentResponse) => {
    setEditingAgentUsers(agent);
  };

  const handleEditGroups = (agent: AgentResponse) => {
    setEditingAgentGroups(agent);
  };

  const handleEditKBs = (agent: AgentResponse) => {
    setEditingAgentKBs(agent);
  };

  const handleCloseEditDetailsDialog = () => {
    setEditingAgentDetails(null);
  };

  const handleCloseEditUsersDialog = () => {
    setEditingAgentUsers(null);
  };

  const handleCloseEditGroupsDialog = () => {
    setEditingAgentGroups(null);
  };

  const handleCloseEditKBsDialog = () => {
    setEditingAgentKBs(null);
  };

  const handleAgentUpdateSuccess = () => {
    listAgents();
    handleCloseEditDetailsDialog();
  };

  const handleAgentCreateSuccess = () => {
    listAgents();
    setIsAddDialogOpen(false);
  };

  const handleAgentUsersUpdateSuccess = () => {
    listAgents();
    handleCloseEditUsersDialog();
  };

  const handleAgentGroupsUpdateSuccess = () => {
    listAgents();
    handleCloseEditGroupsDialog();
  };

  const handleAgentKBsUpdateSuccess = () => {
    listAgents();
    handleCloseEditKBsDialog();
  };

  return {
    agents,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingAgentDetails,
    editingAgentUsers,
    editingAgentGroups,
    editingAgentKBs,
    handleDeleteAgent,
    handleEditAgent,
    handleEditUsers,
    handleEditGroups,
    handleEditKBs,
    handleCloseEditDetailsDialog,
    handleCloseEditUsersDialog,
    handleCloseEditGroupsDialog,
    handleCloseEditKBsDialog,
    handleAgentUpdateSuccess,
    handleAgentCreateSuccess,
    handleAgentUsersUpdateSuccess,
    handleAgentGroupsUpdateSuccess,
    handleAgentKBsUpdateSuccess,
  };
} 