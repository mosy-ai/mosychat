import { apiClient, KnowledgeBase } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentKBsDialogProps } from "./types";

export function EditAgentKBsDialog(props: EditAgentKBsDialogProps) {
  return (
    <MultiSelectDialog<KnowledgeBase>
      {...props}
      title={`Quản lý cơ sở tri thức cho Agent: ${props.agent.name}`}
      description="Chọn các cơ sở tri thức mà agent này có thể truy cập."
      itemTypeName="knowledge_base"
      fetchItems={() => apiClient.knowledgeBases.list({ limit: 1000 })}
      onSave={(agentId, knowledge_base_ids) => apiClient.agents.update(agentId, { knowledge_base_ids })}
    />
  );
} 