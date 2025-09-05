import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPencil, IconUsers, IconUsersGroup, IconTrash, IconFileText, IconUsers as IconUsersCount, IconUsersGroup as IconGroupsCount, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { KnowledgeBase } from "@/lib/api-client";

interface KnowledgeBaseCardsProps {
  knowledgeBases: KnowledgeBase[];
  onEditDetails: (kb: KnowledgeBase) => void;
  onEditUsers: (kb: KnowledgeBase) => void;
  onEditGroups: (kb: KnowledgeBase) => void;
  onDelete: (kbId: string) => void;
}

export function KnowledgeBaseCards({
  knowledgeBases,
  onEditDetails,
  onEditUsers,
  onEditGroups,
  onDelete,
}: KnowledgeBaseCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {knowledgeBases.map((kb) => (
        <Card key={kb.id} className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border/80 hover:scale-[1.02] gap-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Link
                    href={`/dashboard/knowledge-base/${kb.id}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    {kb.name}
                    <IconExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </CardTitle>
                <CardDescription className="mt-1.5 text-xs text-muted-foreground">
                  Được tạo {new Date(kb.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1">
                <IconFileText className="w-3 h-3" />
                <span className="font-medium">{kb.document_count || 0}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1">
                <IconUsersCount className="w-3 h-3" />
                <span className="font-medium">{kb.users?.length || kb.user_ids?.length || 0}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1">
                <IconGroupsCount className="w-3 h-3" />
                <span className="font-medium">{kb.groups?.length || kb.group_ids?.length || 0}</span>
              </Badge>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <div className="flex justify-between w-full">
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditDetails(kb)}
                  className="h-7 w-7 p-0 hover:bg-accent/50"
                  title="Chỉnh sửa chi tiết"
                >
                  <IconPencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUsers(kb)}
                  className="h-7 w-7 p-0 hover:bg-accent/50"
                  title="Chỉnh sửa người dùng"
                >
                  <IconUsers className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditGroups(kb)}
                  className="h-7 w-7 p-0 hover:bg-accent/50"
                  title="Chỉnh sửa nhóm"
                >
                  <IconUsersGroup className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(kb.id)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Xóa cơ sở tri thức"
              >
                <IconTrash className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 