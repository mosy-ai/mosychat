"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Home,
  Database,
  Users,
  LogOut,
  Bot,
} from "lucide-react";
import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";

interface DashboardLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function DashboardLayout({
  children,
  requireAdmin = false,
}: DashboardLayoutProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }

        setUser(currentUser);

        // Redirect if admin access is required and user is not an admin
        if (requireAdmin && currentUser.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        // Redirect to login if user is not authenticated
      } catch (error) { 
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin]);

  const handleLogout = async () => {
    try {
      document.cookie = '';
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-xl font-bold flex items-center gap-2"
              >
                <Bot className="w-6 h-6" />
                ChatMosyAI
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/chat">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Chat
                  </Button>
                </Link>
                {user?.role === "ADMIN" && (
                  <>
                    <Link href="/dashboard/admin/users">
                      <Button variant="ghost" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Users
                      </Button>
                    </Link>
                    <Link href="/dashboard/knowledge-base">
                      <Button variant="ghost" size="sm">
                        <Database className="w-4 h-4 mr-2" />
                        Knowledge Base
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {user.name} ({user.role})
                  </span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
