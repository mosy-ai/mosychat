"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconPlus, IconLoader, IconExclamationCircle } from "@tabler/icons-react";
import { useKnowledgeBaseList } from "@/hooks/use-knowledge-base-list";
import { KnowledgeBaseCards } from "./knowledge-base-cards";
import { AddKnowledgeBaseDialog } from "@/components/pages/knowledge-base/add-knowledge-base-dialog";
import { EditKnowledgeBaseNameDialog } from "@/components/pages/knowledge-base/edit-knowledge-base-name-dialog";
import { EditKnowledgeBaseUsersDialog } from "@/components/pages/knowledge-base/edit-knowledge-base-users-dialog";
import { EditKnowledgeBaseGroupsDialog } from "@/components/pages/knowledge-base/edit-knowledge-base-groups-dialog";

export function KnowledgeBaseList() {
  
  const {
    knowledgeBases,
    isLoading,
    error,
    isAddDialogOpen,
    editingKBDetails,
    editingKBUsers,
    editingKBGroups,
    setIsAddDialogOpen,
    setEditingKBDetails,
    setEditingKBUsers,
    setEditingKBGroups,
    listKnowledgeBases,
    handleDeleteKB,
  } = useKnowledgeBaseList();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-20">
        <IconLoader className="h-8 w-8 animate-spin text-primary mb-4" />
        Loading Knowledge Bases...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <IconExclamationCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 md:gap-6 md:p-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Knowledge Bases
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Button variant="default" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <IconPlus className="w-4 h-4 mr-2" />
          Create New Knowledge Base
        </Button>
      </div>

      <KnowledgeBaseCards
        knowledgeBases={knowledgeBases}
        onEditDetails={setEditingKBDetails}
        onEditUsers={setEditingKBUsers}
        onEditGroups={setEditingKBGroups}
        onDelete={handleDeleteKB}
      />

      <AddKnowledgeBaseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={listKnowledgeBases}
      />

      {editingKBDetails && (
        <EditKnowledgeBaseNameDialog
          kb={editingKBDetails}
          open={!!editingKBDetails}
          onOpenChange={(open) => !open && setEditingKBDetails(null)}
          onSuccess={listKnowledgeBases}
        />
      )}

      {editingKBUsers && (
        <EditKnowledgeBaseUsersDialog
          kb={editingKBUsers}
          open={!!editingKBUsers}
          onOpenChange={(open) => !open && setEditingKBUsers(null)}
          onSuccess={listKnowledgeBases}
        />
      )}

      {editingKBGroups && (
        <EditKnowledgeBaseGroupsDialog
          kb={editingKBGroups}
          open={!!editingKBGroups}
          onOpenChange={(open) => !open && setEditingKBGroups(null)}
          onSuccess={listKnowledgeBases}
        />
      )}
    </div>
  );
} 