import { apiClient, KnowledgeBase } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentKBsDialogProps } from "./types";

export function EditAgentKBsDialog(props: EditAgentKBsDialogProps) {
  return (
    <MultiSelectDialog<KnowledgeBase>
      {...props}
      title={`Manage Knowledge Bases for Agent: ${props.agent.name}`}
      description="Select the knowledge bases this agent can access."
      itemTypeName="knowledge_base"
      fetchItems={() => apiClient.knowledgeBases.list({ limit: 1000 })}
      onSave={(agentId, knowledge_base_ids) => apiClient.agents.update(agentId, { knowledge_base_ids })}
    />
  );
} 