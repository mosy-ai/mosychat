'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/dashboard-layout';
import { apiClient, KnowledgeBase, CreateKnowledgeBaseRequest, UpdateKnowledgeBaseRequest, UserResponse } from '@/lib/api-client';
import { verifyAndGetMe } from '@/lib/custom-func';
import Link from 'next/link';
import { Trash2, Edit, Plus, FileText, AlertCircle } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKB, setEditingKB] = useState<KnowledgeBase | null>(null);
  const [formData, setFormData] = useState<{ name: string; user_ids?: string[] | null; description?: string }>({
    name: '',
    user_ids: null,
    description: ''
  });

  useEffect(() => {
    loadUserAndKnowledgeBases();
  }, []);

  const loadUserAndKnowledgeBases = async () => {
    setError(null);
    try {
      // Get user info using the custom function
      const userData = await verifyAndGetMe();
      setUser(userData);

      // Load knowledge bases with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const kbPromise = apiClient.listKnowledgeBases();
      
      const response = await Promise.race([kbPromise, timeoutPromise]) as any;
      setKnowledgeBases(response.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createData: CreateKnowledgeBaseRequest = {
        name: formData.name,
        user_ids: formData.user_ids
      };
      await apiClient.createKnowledgeBase(createData);
      setShowCreateDialog(false);
      setFormData({ name: '', description: '' });
      await loadUserAndKnowledgeBases();
      alert('Knowledge base created successfully!');
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
      alert('Failed to create knowledge base: ' + (error as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKB) return;
    
    try {
      const updateData: UpdateKnowledgeBaseRequest = {
        name: formData.name,
        user_ids: formData.user_ids
      };
      await apiClient.updateKnowledgeBase(editingKB.id, updateData);
      setEditingKB(null);
      setFormData({ name: '', description: '' });
      await loadUserAndKnowledgeBases();
      alert('Knowledge base updated successfully!');
    } catch (error) {
      console.error('Failed to update knowledge base:', error);
      alert('Failed to update knowledge base: ' + (error as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base?')) return;
    
    try {
      await apiClient.deleteKnowledgeBase(id);
      await loadUserAndKnowledgeBases();
      alert('Knowledge base deleted successfully!');
    } catch (error) {
      console.error('Failed to delete knowledge base:', error);
      alert('Failed to delete knowledge base: ' + (error as Error).message);
    }
  };

  const startEdit = (kb: KnowledgeBase) => {
    setEditingKB(kb);
    setFormData({ name: kb.name, description: '' });
  };

  const canModifyKB = user?.role === 'ADMIN';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Loading knowledge bases...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
     {user?.role === 'ADMIN' ? (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">
              {user?.role === 'ADMIN' 
                ? 'Create and manage knowledge bases and their documents' 
                : 'Access knowledge bases and manage documents'}
            </p>
          </div>
          {canModifyKB && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Knowledge Base
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Knowledge Base</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <Input
                    placeholder="Knowledge Base Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Create</Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button 
                onClick={loadUserAndKnowledgeBases} 
                variant="outline" 
                size="sm"
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!error && knowledgeBases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Knowledge Bases</h3>
              <p className="text-muted-foreground mb-4">
                {canModifyKB 
                  ? 'Get started by creating your first knowledge base'
                  : 'No knowledge bases available yet'}
              </p>
              {canModifyKB && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Knowledge Base
                </Button>
              )}
            </CardContent>
          </Card>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeBases.map((kb) => (
              <Card key={kb.id} className="relative hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{kb.name}</span>
                    {canModifyKB && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => startEdit(kb)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(kb.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    Created at: {new Date(kb.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    ID: {kb.id.substring(0, 8)}...
                  </p>
                  <Link href={`/dashboard/knowledge-base/${kb.id}`}>
                    <Button className="w-full" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Documents
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editingKB && (
          <Dialog open={!!editingKB} onOpenChange={() => setEditingKB(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Knowledge Base</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  placeholder="Knowledge Base Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit">Update</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingKB(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <Alert >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to manage knowledge bases. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </div>
      )}

    </DashboardLayout>
  );
}
