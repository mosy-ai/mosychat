import { apiClient, GroupResponse } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentGroupsDialogProps } from "./types";

export function EditAgentGroupsDialog(props: EditAgentGroupsDialogProps) {
  return (
    <MultiSelectDialog<GroupResponse>
      {...props}
      title={`Quản lý nhóm cho Agent: ${props.agent.name}`}
      description="Chọn các nhóm có thể liên kết với agent này."
      itemTypeName="group"
      fetchItems={() => apiClient.groups.list({ limit: 1000 })}
      onSave={(agentId, group_ids) => apiClient.agents.update(agentId, { group_ids })}
    />
  );
} 