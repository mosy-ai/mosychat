import { apiClient, GroupResponse } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentGroupsDialogProps } from "./types";

export function EditAgentGroupsDialog(props: EditAgentGroupsDialogProps) {
  return (
    <MultiSelectDialog<GroupResponse>
      {...props}
      title={`Manage Groups for Agent: ${props.agent.name}`}
      description="Select the groups that can be associated with this agent."
      itemTypeName="group"
      fetchItems={() => apiClient.groups.list({ limit: 1000 })}
      onSave={(agentId, group_ids) => apiClient.agents.update(agentId, { group_ids })}
    />
  );
} 