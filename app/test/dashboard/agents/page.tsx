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
  IconCircleCheck,
  IconExclamationCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function KnowledgeBasePage() {
  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Agents
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Button variant="default" size="sm">
          <IconPlus className="w-4 h-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>
      <Table>
        <TableCaption>A list of agents</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ownership</TableHead>
            <TableHead className="text-right">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Mosy Tư Vấn BĐS</TableCell>
            <TableCell>Example Admin</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <IconPencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <EditAgentNameDialog listAgents={() => {}} />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <IconUsers className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <EditAgentGroupUserDialog listAgents={() => {}} />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <IconUsersGroup className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <EditAgentGroupUserDialog listAgents={() => {}} />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <IconDatabase className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <EditAgentKnowledgeBaseDialog listAgents={() => {}} />
                </Dialog>
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

const EditAgentNameDialog = ({ listAgents }: { listAgents: () => void }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const handleSave = async () => {};
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Agent Name</DialogTitle>
        <DialogDescription>Update the name of the agent</DialogDescription>
      </DialogHeader>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
        placeholder="New Agent Name"
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

function EditAgentGroupUserDialog({ listAgents }: { listAgents: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Agent</DialogTitle>
        <DialogDescription>Edit agent's user</DialogDescription>
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
        Update Agent
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

function EditAgentKnowledgeBaseDialog({
  listAgents,
}: {
  listAgents: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Agent</DialogTitle>
        <DialogDescription>Edit agent's knowledge base</DialogDescription>
      </DialogHeader>
      <div className="h-[320px] overflow-y-auto">
        <Table>
          <TableCaption>Group Users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4"></TableHead>
              <TableHead className="w-full">Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }, (_, i) => ({
              id: `kb${i + 1} `,
              name: `Dat Xanh Mien Bac ${i + 1}`,
            })).map((kb) => (
              <TableRow key={kb.id}>
                <TableCell className="px-4">
                  <div className="flex items-center gap-3">
                    <Checkbox id={`kb-${kb.id}`} />
                  </div>
                </TableCell>
                <TableCell>{kb.name}</TableCell>
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
        Update Agent
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
          <AlertDescription>Agent updated successfully!</AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );
}
