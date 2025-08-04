"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconPlus } from "@tabler/icons-react";
import { useAgents } from "@/hooks/use-agents";
import { AgentsTable } from "./agents-table";
import { AddAgentDialog } from "./add-agent-dialog";
import { EditAgentDetailsDialog } from "./edit-agent-details-dialog";
import { EditAgentUsersDialog } from "./edit-agent-users-dialog";
import { EditAgentGroupsDialog } from "./edit-agent-groups-dialog";
import { EditAgentKBsDialog } from "./edit-agent-kbs-dialog";

export function AgentsList() {
  const {
    agents,
    isLoading,
    error,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingAgentDetails,
    editingAgentUsers,
    editingAgentGroups,
    editingAgentKBs,
    handleDeleteAgent,
    handleEditAgent,
    handleEditUsers,
    handleEditGroups,
    handleEditKBs,
    handleCloseEditDetailsDialog,
    handleCloseEditUsersDialog,
    handleCloseEditGroupsDialog,
    handleCloseEditKBsDialog,
    handleAgentUpdateSuccess,
    handleAgentCreateSuccess,
    handleAgentUsersUpdateSuccess,
    handleAgentGroupsUpdateSuccess,
    handleAgentKBsUpdateSuccess,
  } = useAgents();

  if (isLoading) {
    return <div className="p-6">Loading agents...</div>;
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
          Agents
        </h1>
        <Separator />
        <div className="flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <IconPlus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
        <AgentsTable
          agents={agents}
          onDeleteAgent={handleDeleteAgent}
          onEditAgent={handleEditAgent}
          onEditUsers={handleEditUsers}
          onEditGroups={handleEditGroups}
          onEditKBs={handleEditKBs}
        />
      </div>

      <AddAgentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAgentCreateSuccess}
      />

      {editingAgentDetails && (
        <EditAgentDetailsDialog
          key={editingAgentDetails.id}
          agent={editingAgentDetails}
          open={!!editingAgentDetails}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditDetailsDialog()}
          onSuccess={handleAgentUpdateSuccess}
        />
      )}

      {editingAgentUsers && (
        <EditAgentUsersDialog
          key={editingAgentUsers.id}
          agent={editingAgentUsers}
          open={!!editingAgentUsers}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditUsersDialog()}
          onSuccess={handleAgentUsersUpdateSuccess}
        />
      )}

      {editingAgentGroups && (
        <EditAgentGroupsDialog
          key={editingAgentGroups.id}
          agent={editingAgentGroups}
          open={!!editingAgentGroups}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditGroupsDialog()}
          onSuccess={handleAgentGroupsUpdateSuccess}
        />
      )}

      {editingAgentKBs && (
        <EditAgentKBsDialog
          key={editingAgentKBs.id}
          agent={editingAgentKBs}
          open={!!editingAgentKBs}
          onOpenChange={(isOpen) => !isOpen && handleCloseEditKBsDialog()}
          onSuccess={handleAgentKBsUpdateSuccess}
        />
      )}
    </>
  );
} 