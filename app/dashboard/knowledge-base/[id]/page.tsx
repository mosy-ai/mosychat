"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconTrash, IconEdit, IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document, apiClient } from "@/lib/api-client";

export default function KnowledgeBasePage() {
  const [files, setFiles] = useState<Document[]>([]);
  const [editingTags, setEditingTags] = useState<{ [key: string]: boolean }>({});
  const [tempTags, setTempTags] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const params = useParams<{ id: string }>();
  const { id } = params;

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await apiClient.getKnowledgeBase(id);
        setFiles(response.data.documents || []);
        console.log(response.data.documents);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, [id]);

  const handleEditTags = (documentId: string, currentTags: string[] | null) => {
    setEditingTags(prev => ({ ...prev, [documentId]: true }));
    setTempTags(prev => ({ 
      ...prev, 
      [documentId]: currentTags ? currentTags.join(', ') : '' 
    }));
  };

  const handleCancelEdit = (documentId: string) => {
    setEditingTags(prev => ({ ...prev, [documentId]: false }));
    setTempTags(prev => ({ ...prev, [documentId]: '' }));
  };

  const handleSaveTags = async (documentId: string) => {
    setLoading(prev => ({ ...prev, [documentId]: true }));
    
    try {
      const tagsString = tempTags[documentId] || '';
      const tagsArray = tagsString
        .split(/,|\s+/)
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      await apiClient.updateDocument(documentId, {
        document_tags: tagsArray.length > 0 ? tagsArray : null
      });

      // Update the local state
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === documentId 
            ? { ...file, document_tags: tagsArray.length > 0 ? tagsArray : null }
            : file
        )
      );

      setEditingTags(prev => ({ ...prev, [documentId]: false }));
      setTempTags(prev => ({ ...prev, [documentId]: '' }));
      
    } catch (error) {
      console.error("Error updating tags:", error);
      // You might want to show a toast notification here
      alert("Failed to update tags. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleTagInputChange = (documentId: string, value: string) => {
    setTempTags(prev => ({ ...prev, [documentId]: value }));
  };

  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-3xl font-bold tracking-tight text-balance">
        Knowledge Base
      </h1>
      <span className="italic font-light text-sm">ID: {id}</span>
      <Separator />
      <Tabs defaultValue="file" className="gap-4 px-4 md:gap-6 md:py-6">
        <TabsList>
          <TabsTrigger value="file" className="px-8">
            Files
          </TabsTrigger>
          <TabsTrigger value="url" className="px-8">
            Urls
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file" className="flex flex-col gap-4 md:gap-6">
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
                <TableHead>Document Tags</TableHead>
                <TableHead>Url</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Functions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.file_name}</TableCell>
                  <TableCell>
                    {editingTags[file.id] ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempTags[file.id] || ''}
                          onChange={(e) => handleTagInputChange(file.id, e.target.value)}
                          placeholder="Enter tags separated by commas"
                          className="min-w-[200px]"
                          disabled={loading[file.id]}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveTags(file.id)}
                          disabled={loading[file.id]}
                        >
                          <IconCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelEdit(file.id)}
                          disabled={loading[file.id]}
                        >
                          <IconX className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1">
                          {file.document_tags?.length ? (
                            file.document_tags.map((tag) => (
                              <Badge key={tag} className="mr-2">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <Badge className="mr-2">No tags</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTags(file.id, file.document_tags || [])}
                        >
                          <IconEdit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={file.file_path}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                  <TableCell>{(file.file_size / 1024 / 1024).toFixed(2)} MB</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-amber-100">
                      {file.status}
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
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="url" className="flex flex-col gap-4 md:gap-6">
          <div className="flex justify-end gap-2">
            <Input type="text" className="max-w-xs" placeholder="Enter article url" />
            <Button variant="outline" size="sm">
              Add Articles
            </Button>
          </div>
          <Table>
            <TableCaption>A list of knowledge base articles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Functions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <Link href={file.file_path} target="_blank" className="text-blue-500 hover:underline">
                      View
                    </Link>
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}