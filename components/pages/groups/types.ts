import { GroupResponse, UserResponse } from "@/lib/api-client";

export interface GroupsListProps {
  groups: GroupResponse[];
  onDeleteGroup: (groupId: string) => void;
  onEditGroup: (group: GroupResponse) => void;
  onEditUsers: (group: GroupResponse) => void;
}

export interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditGroupNameDialogProps {
  group: GroupResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditGroupUsersDialogProps {
  group: GroupResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
} 