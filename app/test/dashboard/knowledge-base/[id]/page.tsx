"use client";

import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function KnowledgeBasePage() {
  const params = useParams<{ id: string }>();
  const { id } = params;

  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Knowledge Base
      </h1>
      <span className="italic font-light text-sm">ID: {id}</span>
      <Separator />
      <div className="flex justify-end gap-2">
        <Input type="file" className="max-w-xs" multiple />
        <Button variant="outline" size="sm">
          Add Articles
        </Button>
      </div>
      <Table>
        <TableCaption>A list of knowledge base articles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Dat Xanh Mien Bac</TableCell>
            <TableCell>1.27 Mb</TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs bg-amber-100">
                COMPLETED
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm">
                  <IconTrash className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
