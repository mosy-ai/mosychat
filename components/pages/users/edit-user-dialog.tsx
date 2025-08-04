import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconExclamationCircle, IconCircleCheck } from "@tabler/icons-react";
import { apiClient, UserResponse } from "@/lib/api-client";
import { EditUserDialogProps } from "./types";

export function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
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
      onSuccess();
      // Reset password fields
      setPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset password fields when closing
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <Label htmlFor="password">Password (leave blank to keep current)</Label>
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
    </Dialog>
  );
} 