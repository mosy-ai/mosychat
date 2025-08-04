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
import { Badge } from "@/components/ui/badge";
import { IconPencil, IconUsers, IconUsersGroup, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { KnowledgeBase } from "@/lib/api-client";

interface KnowledgeBaseTableProps {
  knowledgeBases: KnowledgeBase[];
  onEditDetails: (kb: KnowledgeBase) => void;
  onEditUsers: (kb: KnowledgeBase) => void;
  onEditGroups: (kb: KnowledgeBase) => void;
  onDelete: (kbId: string) => void;
}

export function KnowledgeBaseTable({
  knowledgeBases,
  onEditDetails,
  onEditUsers,
  onEditGroups,
  onDelete,
}: KnowledgeBaseTableProps) {
  return (
    <Table>
      <TableCaption>A list of your knowledge bases.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Documents</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {knowledgeBases.map((kb) => (
          <TableRow key={kb.id}>
            <TableCell className="font-medium">
              <Link
                href={`/dashboard/knowledge-base/${kb.id}`}
                className="hover:underline text-blue-600 dark:text-blue-400"
              >
                {kb.name}
              </Link>
            </TableCell>
            <TableCell className="max-w-xs truncate">
              {kb.description || "—"}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{kb.document_count || 0}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{kb.user_count || 0}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{kb.group_count || 0}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditDetails(kb)}
                >
                  <IconPencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditUsers(kb)}
                >
                  <IconUsers className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditGroups(kb)}
                >
                  <IconUsersGroup className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(kb.id)}
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