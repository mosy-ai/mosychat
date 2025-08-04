import { AgentResponse, UserResponse, GroupResponse, KnowledgeBase } from "@/lib/api-client";

export interface AgentsListProps {
  agents: AgentResponse[];
  onDeleteAgent: (agentId: string) => void;
  onEditAgent: (agent: AgentResponse) => void;
  onEditUsers: (agent: AgentResponse) => void;
  onEditGroups: (agent: AgentResponse) => void;
  onEditKBs: (agent: AgentResponse) => void;
}

export interface AddAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditAgentDetailsDialogProps {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface MultiSelectDialogProps<T extends { id: string; name: string | null }> {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  fetchItems: () => Promise<{ data: T[] }>;
  onSave: (agentId: string, selectedIds: string[]) => Promise<any>;
  title: string;
  description: string;
  itemTypeName: string;
}

export interface EditAgentUsersDialogProps {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditAgentGroupsDialogProps {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditAgentKBsDialogProps {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
} 