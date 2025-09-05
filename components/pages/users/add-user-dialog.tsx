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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconExclamationCircle, IconCircleCheck } from "@tabler/icons-react";
import { apiClient, CreateUserRequest } from "@/lib/api-client";
import { AddUserDialogProps } from "./types";

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
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
      setError("Mật khẩu không khớp");
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
      onSuccess();
      setName("");
      setEmail("");
      setRole("USER");
      setPassword("");
      setConfirmPassword("");
      
    } catch (e: any) {
      setError(e.message || "Tạo người dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setEmail("");
      setRole("USER");
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
          <DialogTitle>Thêm người dùng</DialogTitle>
          <DialogDescription>Tạo tài khoản người dùng mới</DialogDescription>
          <div className="grid w-full max-w-sm items-center gap-2 py-2">
            <Label htmlFor="name">Tên</Label>
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
            <Label htmlFor="role">Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent id="role">
                <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                <SelectItem value="USER">Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-2 py-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-2 py-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
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
            {loading ? "Đang tạo..." : "Tạo người dùng"}
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
              <AlertDescription>Tạo người dùng thành công!</AlertDescription>
            </Alert>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 