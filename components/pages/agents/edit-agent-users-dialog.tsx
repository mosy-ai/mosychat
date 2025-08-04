import { apiClient, UserResponse } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentUsersDialogProps } from "./types";

export function EditAgentUsersDialog(props: EditAgentUsersDialogProps) {
  return (
    <MultiSelectDialog<UserResponse>
      {...props}
      title={`Manage Users for Agent: ${props.agent.name}`}
      description="Select the users that can be associated with this agent."
      itemTypeName="user"
      fetchItems={() => apiClient.users.list({ size: 1000 })}
      onSave={(agentId, user_ids) => apiClient.agents.update(agentId, { user_ids })}
    />
  );
} 