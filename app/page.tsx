"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/navbar";
import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";

export default function Home() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Welcome to ChatMosyAI</CardTitle>
            <CardDescription>
              MosyAI helps you get answers, find inspiration and be more
              productive. It is free to use and easy to try. Just ask and
              ChatMosyAI can help with writing, learning, brainstorming and
              more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Button asChild className="w-full px-16">
                <Link href="/login">Loading ...</Link>
              </Button>
            ) : user ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    ✅ You are logged in as {user.name} ({user.role})
                  </AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>You are not logged in</AlertDescription>
                </Alert>
                <Button asChild className="w-full">
                  <Link href="/login">Login to Access Dashboard</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
