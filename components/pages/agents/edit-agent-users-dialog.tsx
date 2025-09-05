import { apiClient, UserResponse } from "@/lib/api-client";
import { MultiSelectDialog } from "./multi-select-dialog";
import { EditAgentUsersDialogProps } from "./types";

export function EditAgentUsersDialog(props: EditAgentUsersDialogProps) {
  return (
    <MultiSelectDialog<UserResponse>
      {...props}
      title={`Quản lý người dùng cho Agent: ${props.agent.name}`}
      description="Chọn các người dùng có thể liên kết với agent này."
      itemTypeName="user"
      fetchItems={() => apiClient.users.list({ size: 1000 })}
      onSave={(agentId, user_ids) => apiClient.agents.update(agentId, { user_ids })}
    />
  );
} 