import { UserResponse } from "@/lib/api-client";

export interface UsersListProps {
  users: UserResponse[];
  onDeleteUser: (userId: string) => void;
  onEditUser: (user: UserResponse) => void;
}

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export interface EditUserDialogProps {
  user: UserResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
} 