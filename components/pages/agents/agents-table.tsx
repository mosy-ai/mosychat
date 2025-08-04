import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconPencil, IconUsers, IconUsersGroup, IconTrash, IconDatabase } from "@tabler/icons-react";
import { AgentsListProps } from "./types";

export function AgentsTable({ agents, onDeleteAgent, onEditAgent, onEditUsers, onEditGroups, onEditKBs }: AgentsListProps) {
  return (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditAgent(agent)}
                >
                  <IconPencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUsers(agent)}
                >
                  <IconUsers className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditGroups(agent)}
                >
                  <IconUsersGroup className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditKBs(agent)}
                >
                  <IconDatabase className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteAgent(agent.id)}
                >
                  <IconTrash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 