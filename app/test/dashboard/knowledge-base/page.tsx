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
  IconLoader2,
  IconExclamationCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient, KnowledgeBase } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function KnowledgeBasePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const listKnowledgeBases = async () => {
    try {
      const response = await apiClient.listKnowledgeBases();
      setKnowledgeBases(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch knowledge bases:", error);
    }
  };
  useEffect(() => {
    listKnowledgeBases();
  }, []);
  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Knowledge Base
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          </DialogTrigger>
          <AddKnowledgeBaseDialog listKnowledgeBases={listKnowledgeBases} />
        </Dialog>
      </div>
      {loading && (
        <div className="flex flex-col items-center pt-20">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          Loading...
        </div>
      )}
      <Table>
        <TableCaption>A list of knowledge base</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {knowledgeBases.map((kb, index) => (
            <TableRow key={kb.id}>
              <TableCell>
                <Link
                  href={`/test/dashboard/knowledge-base/${kb.id}`}
                  className="block w-full h-full"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {kb.name}
                </Link>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconPencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <EditKnowledgeBaseNameDialog
                      listKnowledgeBases={listKnowledgeBases}
                      id={kb.id}
                    />
                  </Dialog>
                  {/* <Button variant="ghost" size="sm">
                    <IconUsers className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <IconUsersGroup className="w-4 h-4" />
                  </Button> */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconUsers className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <EditKnowledgeBaseGroupUserDialog
                      listGroups={listKnowledgeBases}
                    />
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconUsersGroup className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <EditKnowledgeBaseGroupUserDialog
                      listGroups={listKnowledgeBases}
                    />
                  </Dialog>
                  <Button variant="ghost" size="sm">
                    <IconTrash className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
const AddKnowledgeBaseDialog = ({
  listKnowledgeBases,
}: {
  listKnowledgeBases: () => void;
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Knowledge Base</DialogTitle>
        <DialogDescription>
          Create a new knowledge base to store your articles.
        </DialogDescription>
      </DialogHeader>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
        placeholder="Knowledge Base Name"
      />
      <Button
        variant="default"
        onClick={() => {}}
        disabled={!name.trim()}
        className="mt-4"
      >
        Save
      </Button>
      {error && (
        <Alert variant="destructive">
          <IconExclamationCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <IconCircleCheck className="w-4 h-4" />
          <AlertDescription>
            Knowledge base name updated successfully!
          </AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );
};
const EditKnowledgeBaseNameDialog = ({
  id,
  listKnowledgeBases,
}: {
  id: string;
  listKnowledgeBases: () => void;
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const handleSave = async () => {
    try {
      await apiClient.updateKnowledgeBase(id, { name });
      setSuccess(true);
      setError(null);
      listKnowledgeBases();
    } catch (error) {
      setError("Failed to update knowledge base name");
      console.error("Failed to update knowledge base name:", error);
    } finally {
      setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Knowledge Base Name</DialogTitle>
        <DialogDescription>
          Change the name of the knowledge base.
        </DialogDescription>
      </DialogHeader>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
        placeholder="New Knowledge Base Name"
      />
      <Button
        variant="default"
        onClick={handleSave}
        disabled={!name.trim()}
        className="mt-4"
      >
        Save
      </Button>
      {error && (
        <Alert variant="destructive">
          <IconExclamationCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <IconCircleCheck className="w-4 h-4" />
          <AlertDescription>
            Knowledge base name updated successfully!
          </AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );
};

function EditKnowledgeBaseGroupUserDialog({
  listGroups,
}: {
  listGroups: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogDescription>Edit group name</DialogDescription>
      </DialogHeader>
      <div className="h-[320px] overflow-y-auto">
        <Table>
          <TableCaption>Group Users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }, (_, i) => ({
              id: `u${i + 1}`,
              name: `User ${i + 1}`,
              email: `user${i + 1}@example.com`,
              role: i === 0 ? "Admin" : "User",
            })).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Checkbox id={`user-${user.id}`} />
                  </div>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-right">{user.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        variant="default"
        onClick={() => {}}
        // disabled={}
        className="mt-4 w-full"
      >
        Update Group
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <IconExclamationCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mt-2">
          <IconCircleCheck className="w-4 h-4" />
          <AlertDescription>Group updated successfully!</AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );
}
