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
import { IconPencil, IconUsers, IconTrash } from "@tabler/icons-react";
import { GroupsListProps } from "./types";

export function GroupsTable({ groups, onDeleteGroup, onEditGroup, onEditUsers }: GroupsListProps) {
  return (
    <Table>
      <TableCaption>A list of groups. Found {groups.length} groups.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>User Count</TableHead>
          <TableHead className="text-right">Functions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id}>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.description}</TableCell>
            <TableCell>{group.user_count ?? 0}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditGroup(group)}
                >
                  <IconPencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUsers(group)}
                >
                  <IconUsers className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteGroup(group.id)}
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