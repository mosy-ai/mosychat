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
  IconTrash,
  IconPlus,
  IconExclamationCircle,
  IconLoader2,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { apiClient, CreateUserRequest, UserResponse } from "@/lib/api-client";

export default function KnowledgeBasePage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.users.list();
      setUsers(res.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    listUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.users.delete(userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (e: any) {
      setError(e.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col  p-4 md:gap-6 md:p-10">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
        Users
      </h1>
      <Separator />
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <IconPlus className="w-4 h-4 mr-2" />
              Create New User
            </Button>
          </DialogTrigger>
          <AddUserDialog listUsers={listUsers} />
        </Dialog>
      </div>
      {loading && (
        <div className="flex flex-col items-center pt-20">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          Loading...
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <IconExclamationCircle className="w-4 h-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Functions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || "-"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger>
                      <IconPencil className="w-4 h-4" />
                    </DialogTrigger>
                    <EditUserDialog listUsers={listUsers} user={user} />
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
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

function EditUserDialog({
  user,
  listUsers,
}: {
  user?: UserResponse;
  listUsers: () => void;
}) {
  // For demo, hardcoded user info. Replace with props/state as needed.
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const userId = user?.id || "none_id";

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const updateData: any = {
        name,
        email,
      };
      if (password) updateData.password = password;
      await apiClient.users.update(userId, updateData);
      setSuccess(true);
      listUsers();
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>Edit user details</DialogDescription>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Nguyen Van A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            type="password"
            id="confirm-password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button
          className="mt-4 w-full"
          variant="default"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update User"}
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
            <AlertDescription>User updated successfully!</AlertDescription>
          </Alert>
        )}
      </DialogHeader>
    </DialogContent>
  );
}

function AddUserDialog({ listUsers }: { listUsers: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const req: CreateUserRequest = {
        email,
        name,
        password,
        is_active: true,
        role,
      };
      await apiClient.users.create(req);
      setSuccess(true);
      listUsers();
    } catch (e: any) {
      setError(e.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add User</DialogTitle>
        <DialogDescription>Create a new user account</DialogDescription>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Nguyen Van A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent id="role">
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full max-w-sm items-center gap-2 py-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid wfull max-w-sm items-center gap-2 py-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            type="password"
            id="confirm-password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button
          className="mt-4 w-full"
          variant="default"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create User"}
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
            <AlertDescription>User created successfully!</AlertDescription>
          </Alert>
        )}
      </DialogHeader>
    </DialogContent>
  );
}
