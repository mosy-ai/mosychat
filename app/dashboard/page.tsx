'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        if (data.success && data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getUser();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('Password changed successfully!');
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '' });
      } else {
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      alert('Error changing password');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">Dashboard</CardTitle>
              <Button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                variant="outline"
              >
                Change Password
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <Alert>
                <AlertDescription>
                  🎉 Welcome {user.username}! You are logged in as {user.role}.
                </AlertDescription>
              </Alert>
            )}

            {showPasswordForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Update Password</Button>
                      <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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
                {user?.role !== 'admin' && (
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <Link href="/dashboard/knowledge-base">
                    <CardHeader>
                      <CardTitle className="text-lg">Knowledge Base</CardTitle>
                      <CardDescription>Access and manage knowledge bases</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                )}
                {user?.role === 'admin' && (
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
