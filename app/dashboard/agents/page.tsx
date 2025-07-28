"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconPencil,
  IconUsers,
  IconUsersGroup,
  IconTrash,
  IconPlus,
  IconDatabase,
  IconExclamationCircle,
  IconLoader,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Import the apiClient and all necessary types
// Make sure this path is correct for your project
import { 
  apiClient, 
  AgentResponse, 
  UserResponse, 
  GroupResponse, 
  KnowledgeBase 
} from "@/lib/api-client";

// Renamed component to reflect its purpose
export default function AgentsPage() {
  // State for the main page
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State to control which dialog is open and for which agent
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAgentDetails, setEditingAgentDetails] = useState<AgentResponse | null>(null);
  const [editingAgentUsers, setEditingAgentUsers] = useState<AgentResponse | null>(null);
  const [editingAgentGroups, setEditingAgentGroups] = useState<AgentResponse | null>(null);
  const [editingAgentKBs, setEditingAgentKBs] = useState<AgentResponse | null>(null);

  // Callback to fetch/refresh the list of agents
  const listAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.agents.list();
      setAgents(response.data.map(agent => ({ ...agent, user_count: agent.users?.length || 0, group_count: agent.groups?.length || 0, knowledge_base_count: agent.knowledge_base_count || 0 })) || []); 

    } catch (err: any) {
      setError(err.message || "Failed to fetch agents.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    listAgents();
  }, [listAgents]);

  // Handler for deleting an agent
  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await apiClient.agents.delete(agentId);
        await listAgents();
      } catch (err: any) {
        alert(err.message || "Failed to delete agent.");
      }
    }
  };

  // Main page loading/error states
  if (isLoading) {
    return <div className="p-6">Loading agents...</div>;
  }
  if (error) {
    return <div className="p-6"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
  }

  return (
    <>
      <div className="flex flex-col  p-4 md:gap-6 md:p-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Agents
        </h1>
        <Separator />
        <div className="flex justify-end">
          <Button variant="default" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <IconPlus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </div>
        <Table>
          <TableCaption>A list of agents. Found {agents.length} agents.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Ownership</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>KBs</TableHead>
              <TableHead className="text-right">Functions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>{agent.created_by?.name ?? 'N/A'}</TableCell>
                <TableCell>{agent.user_count}</TableCell>
                <TableCell>{agent.group_count}</TableCell>
                <TableCell>{agent.knowledge_base_count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingAgentDetails(agent)}><IconPencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingAgentUsers(agent)}><IconUsers className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingAgentGroups(agent)}><IconUsersGroup className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingAgentKBs(agent)}><IconDatabase className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent.id)}><IconTrash className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- DIALOGS --- */}
      {/* Dialogs are rendered conditionally outside the loop for performance */}
      <AddAgentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          listAgents();
        }}
      />

      {editingAgentDetails && (
        <EditAgentDetailsDialog
          key={editingAgentDetails.id}
          agent={editingAgentDetails}
          open={!!editingAgentDetails}
          onOpenChange={(isOpen) => !isOpen && setEditingAgentDetails(null)}
          onSuccess={() => {
            setEditingAgentDetails(null);
            listAgents();
          }}
        />
      )}

      {editingAgentUsers && (
        <EditAgentUsersDialog
          key={editingAgentUsers.id}
          agent={editingAgentUsers}
          open={!!editingAgentUsers}
          onOpenChange={(isOpen) => !isOpen && setEditingAgentUsers(null)}
          onSuccess={() => {
            setEditingAgentUsers(null);
            listAgents();
          }}
        />
      )}
      
      {editingAgentGroups && (
        <EditAgentGroupsDialog
          key={editingAgentGroups.id}
          agent={editingAgentGroups}
          open={!!editingAgentGroups}
          onOpenChange={(isOpen) => !isOpen && setEditingAgentGroups(null)}
          onSuccess={() => {
            setEditingAgentGroups(null);
            listAgents();
          }}
        />
      )}

      {editingAgentKBs && (
        <EditAgentKBsDialog
          key={editingAgentKBs.id}
          agent={editingAgentKBs}
          open={!!editingAgentKBs}
          onOpenChange={(isOpen) => !isOpen && setEditingAgentKBs(null)}
          onSuccess={() => {
            setEditingAgentKBs(null);
            listAgents();
          }}
        />
      )}
    </>
  );
}

// --- Dialog Components ---

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// --- Add Agent Dialog ---
function AddAgentDialog({ open, onOpenChange, onSuccess }: DialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.agents.create({ name, description });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Agent</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent Name" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agent Description"/>
        </div>
        <Button onClick={handleCreate} disabled={!name.trim() || !description.trim() || isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Agent"}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Agent Details Dialog ---
function EditAgentDetailsDialog({ agent, open, onOpenChange, onSuccess }: { agent: AgentResponse } & DialogProps) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiClient.agents.update(agent.id, { name, description });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Agent Details</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent Name" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agent Description"/>
        </div>
        <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}

// --- Generic Multi-Select Dialog Component ---
// We create a generic component to handle the repetitive logic for Users, Groups, and KBs.
interface MultiSelectDialogProps<T extends { id: string; name: string | null }> {
  agent: AgentResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  fetchItems: () => Promise<{ data: T[] }>;
  onSave: (agentId: string, selectedIds: string[]) => Promise<any>;
  title: string;
  description: string;
  itemTypeName: string;
}

function MultiSelectDialog<T extends { id: string; name: string | null; email?: string }>({
  agent, open, onOpenChange, onSuccess, fetchItems, onSave, title, description, itemTypeName
}: MultiSelectDialogProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Set initial selections from the agent prop
      const initialIds = agent[`${itemTypeName.toLowerCase()}_ids` as keyof AgentResponse] as string[] || [];
      setSelectedIds(new Set(initialIds));

      const loadItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetchItems();
          setItems(response.data || []);
        } catch (err: any) {
          setError(`Failed to load ${itemTypeName}s.`);
        } finally {
          setIsLoading(false);
        }
      };
      loadItems();
    }
  }, [open, agent, fetchItems, itemTypeName]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) newSelectedIds.add(id);
    else newSelectedIds.delete(id);
    setSelectedIds(newSelectedIds);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(agent.id, Array.from(selectedIds));
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to update ${itemTypeName}s.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="h-[320px] overflow-y-auto border rounded-md relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <IconLoader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading {itemTypeName}s...</span>
            </div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead></TableHead><TableHead>Name</TableHead>{items[0]?.email && <TableHead>Email</TableHead>}</TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><Checkbox checked={selectedIds.has(item.id)} onCheckedChange={(c) => handleCheckboxChange(item.id, !!c)}/></TableCell>
                    <TableCell>{item.name}</TableCell>
                    {item.email && <TableCell>{item.email}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading || isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : `Save ${itemTypeName}s`}
        </Button>
        {error && <Alert variant="destructive"><IconExclamationCircle className="w-4 h-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      </DialogContent>
    </Dialog>
  );
}


// --- Specific Implementations of the MultiSelectDialog ---

function EditAgentUsersDialog(props: { agent: AgentResponse } & DialogProps) {
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

function EditAgentGroupsDialog(props: { agent: AgentResponse } & DialogProps) {
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

function EditAgentKBsDialog(props: { agent: AgentResponse } & DialogProps) {
  return (
    <MultiSelectDialog<KnowledgeBase>
      {...props}
      title={`Manage Knowledge Bases for Agent: ${props.agent.name}`}
      description="Select the knowledge bases this agent can access."
      itemTypeName="knowledge_base"
      fetchItems={() => apiClient.knowledgeBases.list({ limit: 1000 })}
      onSave={(agentId, knowledge_base_ids) => apiClient.agents.update(agentId, { knowledge_base_ids })}
    />
  );
}