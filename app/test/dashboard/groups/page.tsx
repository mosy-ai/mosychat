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
  IconTrash,
  IconPlus,
  IconExclamationCircle,
  IconCircleCheck,
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
import { Label } from "@/components/ui/label";

export default function GroupsPage() {
  // Demo state for groups
  const [groups, setGroups] = useState([
    { id: "1", name: "Dat Xanh Mien Bac" },
  ]);
  return (
    <div className="flex flex-col gap-4 px-4 md:gap-6 md:py-6">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Groups
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <IconPlus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <AddGroupDialog listGroups={() => {}} />
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of groups</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell>{group.name}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconPencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <EditGroupNameDialog listGroups={() => {}} />
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconUsers className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <EditGroupUsersDialog listGroups={() => {}} />
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setGroups(groups.filter((g) => g.id !== group.id))
                    }
                  >
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

// Add Group Dialog
function AddGroupDialog({ listGroups }: { listGroups: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const handleAdd = () => {};
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Group</DialogTitle>
        <DialogDescription>Create a new group</DialogDescription>
      </DialogHeader>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Group Name"
        className="w-full"
      />
      <Button
        variant="default"
        onClick={handleAdd}
        disabled={!name.trim()}
        className="mt-4 w-full"
      >
        Add Group
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
          <AlertDescription>Group added successfully!</AlertDescription>
        </Alert>
      )}
    </DialogContent>
  );
}

// Edit Group Dialog
function EditGroupNameDialog({ listGroups }: { listGroups: () => void }) {
  const [name, setName] = useState();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = () => {};

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogDescription>Edit group name</DialogDescription>
      </DialogHeader>
      <Input
        value={name}
        onChange={(e) => {}}
        placeholder="Group Name"
        className="w-full"
      />
      <Button
        variant="default"
        onClick={handleUpdate}
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

// Edit Group Users Dialog
function EditGroupUsersDialog({ listGroups }: { listGroups: () => void }) {
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
