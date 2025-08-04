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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IconTrash, IconEdit, IconCheck, IconX, IconLoader } from "@tabler/icons-react";
import Link from "next/link";
import { DocumentPurpose } from "@/lib/api-client";
import { DocumentTableProps } from "./types";

export function DocumentTable({
  documents,
  pendingUploads,
  onDeleteDocument,
  onEditTags,
  onCancelEdit,
  onSaveTags,
  editingTags,
  tempTags,
  tagUpdateLoading,
  setTempTags,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
}: DocumentTableProps) {
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Table>
          <TableCaption>A list of your uploaded documents.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUploads.map((upload) => (
              <TableRow key={upload.id} className="opacity-60">
                <TableCell className="font-medium max-w-xs truncate">
                  {upload.name}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">—</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{upload.purpose}</Badge>
                </TableCell>
                <TableCell>{upload.size ? `${upload.size} bytes` : "—"}</TableCell>
                <TableCell>
                  {upload.status === "UPLOADING" ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IconLoader className="w-3 h-3 animate-spin" />
                      Uploading
                    </Badge>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="destructive">Error</Badge>
                      </TooltipTrigger>
                      <TooltipContent>{upload.errorMessage}</TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" disabled>
                    <IconTrash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  <Tooltip>
                    <TooltipTrigger>{doc.file_name}</TooltipTrigger>
                    <TooltipContent>{doc.file_name}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {editingTags[doc.id] ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempTags[doc.id] || ""}
                        onChange={(e) =>
                          setTempTags((prev) => ({
                            ...prev,
                            [doc.id]: e.target.value,
                          }))
                        }
                        disabled={tagUpdateLoading[doc.id]}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSaveTags(doc.id)}
                        disabled={tagUpdateLoading[doc.id]}
                      >
                        {tagUpdateLoading[doc.id] ? (
                          <IconLoader className="w-4 h-4 animate-spin" />
                        ) : (
                          <IconCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancelEdit(doc.id)}
                        disabled={tagUpdateLoading[doc.id]}
                      >
                        <IconX className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {doc.document_tags?.length ? (
                          doc.document_tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-blue-500 text-white dark:bg-blue-600"
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No tags
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditTags(doc.id, doc.document_tags)}
                      >
                        <IconEdit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.purpose === DocumentPurpose.KNOWLEDGE_BASE
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {doc.purpose}
                  </Badge>
                </TableCell>
                <TableCell>{doc.file_size ? `${doc.file_size} bytes` : "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.status === "COMPLETED" ? "default" : "outline"
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteDocument(doc.id)}
                  >
                    <IconTrash className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, documents.length)} of {documents.length} documents
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 