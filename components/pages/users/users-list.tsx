"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconPlus, IconExclamationCircle, IconLoader2 } from "@tabler/icons-react";
import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "./users-table";
import { AddUserDialog } from "./add-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

export function UsersList() {
  const {
    users,
    loading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingUser,
    handleDeleteUser,
    handleEditUser,
    handleCloseEditDialog,
    handleUserUpdateSuccess,
    handleUserCreateSuccess,
  } = useUsers();

  if (loading) {
    return (
      <div className="flex flex-col items-center pt-20">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <IconExclamationCircle className="w-4 h-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col p-4 md:gap-6 md:p-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Users
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <IconPlus className="w-4 h-4 mr-2" />
          Create New User
        </Button>
      </div>
      <UsersTable
        users={users}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
      />
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleUserCreateSuccess}
      />
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={handleCloseEditDialog}
          onSuccess={handleUserUpdateSuccess}
        />
      )}
    </div>
  );
} 