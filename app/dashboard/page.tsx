'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserResponse } from '@/lib/api-client';
import { verifyAndGetMe } from '@/lib/custom-func';

export default function Dashboard() {
  const [user, setUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await verifyAndGetMe();
        if (!currentUser) {
          throw new Error("User not found");
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getUser();
  }, []);


  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">Dashboard</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <Alert>
                <AlertDescription>
                  🎉 Welcome {user.name}! You are logged in as {user.role}.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Available Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <Link href="/dashboard/chat">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Chat</CardTitle>
                      <CardDescription>Chat with AI assistant for help and information</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                {user?.role !== 'ADMIN' && (
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <Link href="/dashboard/knowledge-base">
                    <CardHeader>
                      <CardTitle className="text-lg">Knowledge Base</CardTitle>
                      <CardDescription>Access and manage knowledge bases</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                )}
                {user?.role === 'ADMIN' && (
                  <>
                    <Card className="hover:bg-accent cursor-pointer transition-colors">
                      <Link href="/dashboard/admin/users">
                        <CardHeader>
                          <CardTitle className="text-lg">Users Panel</CardTitle>
                          <CardDescription>Manage users settings</CardDescription>
                        </CardHeader>
                      </Link>
                    </Card>
                    <Card className="hover:bg-accent cursor-pointer transition-colors">
                      <Link href="/dashboard/knowledge-base">
                        <CardHeader>
                          <CardTitle className="text-lg">KB Admin</CardTitle>
                          <CardDescription>Manage knowledge bases and documents</CardDescription>
                        </CardHeader>
                      </Link>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
