"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconPlus } from "@tabler/icons-react";
import { useGroups } from "@/hooks/use-groups";
import { GroupsTable } from "./groups-table";
import { AddGroupDialog } from "./add-group-dialog";
import { EditGroupNameDialog } from "./edit-group-name-dialog";
import { EditGroupUsersDialog } from "./edit-group-users-dialog";

export function GroupsList() {
  const {
    groups,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingGroup,
    editingUsersForGroup,
    handleDeleteGroup,
    handleEditGroup,
    handleEditUsers,
    handleCloseEditDialog,
    handleCloseEditUsersDialog,
    handleGroupUpdateSuccess,
    handleGroupCreateSuccess,
    handleGroupUsersUpdateSuccess,
  } = useGroups();

  if (isLoading) {
    return <div className="p-6">Loading groups...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col p-4 md:gap-6 md:p-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Groups
        </h1>
        <Separator />
        <div className="flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <IconPlus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
        <GroupsTable
          groups={groups}
          onDeleteGroup={handleDeleteGroup}
          onEditGroup={handleEditGroup}
          onEditUsers={handleEditUsers}
        />
      </div>

      <AddGroupDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleGroupCreateSuccess}
      />

      {editingGroup && (
        <EditGroupNameDialog
          key={editingGroup.id}
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditDialog()}
          onSuccess={handleGroupUpdateSuccess}
        />
      )}

      {editingUsersForGroup && (
        <EditGroupUsersDialog
          key={editingUsersForGroup.id}
          group={editingUsersForGroup}
          open={!!editingUsersForGroup}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditUsersDialog()}
          onSuccess={handleGroupUsersUpdateSuccess}
        />
      )}
    </>
  );
} 