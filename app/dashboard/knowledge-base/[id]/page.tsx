'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/dashboard-layout';
import { apiClient, Document, KnowledgeBase, DocumentStatus } from '@/lib/api-client';
import { verifyAndGetMe } from '@/lib/custom-func';
import { Upload, Download, Trash2, ArrowLeft, FileText, Search } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBaseDocuments() {
  const params = useParams();
  const kbId = params.id as string;
  
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadKnowledgeBase();
  }, [kbId]);

  const loadKnowledgeBase = async () => {
    try {
      // Set up authentication
      await verifyAndGetMe();
      
      // Get knowledge base info
      const kbResponse = await apiClient.getKnowledgeBase(kbId);
      setKb(kbResponse.data);
      
      setDocuments(kbResponse.data.documents || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      alert('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (!kbId) {
        alert('Knowledge Base ID is required');
        return;
      }
      
      // Create document with knowledge base ID in the document_dto
      const documentDto = JSON.stringify({
        knowledge_base_id: kbId,
        description: `string`,
        summary: `string`,
      });
      
      await apiClient.createDocument({
        document_dto: documentDto,
        file: file
      });
      await loadKnowledgeBase(); // Reload to show new document
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await apiClient.viewRawFile(doc.id);
      // Create a blob from the response
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await apiClient.deleteDocument(docId);
      await loadKnowledgeBase(); // Reload to remove deleted document
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout requireAdmin>
        <div className="text-center">Loading knowledge base...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/knowledge-base">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Bases
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              {kb?.name}
            </h1>
            <p className="text-muted-foreground">Knowledge Base ID: {kb?.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="flex-1"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Uploading...
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PDF, DOC, DOCX, TXT, MD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No documents match your search' : 'No documents found'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document using the form above.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.file_name}</TableCell>
                      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === DocumentStatus.COMPLETED ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          doc.status === DocumentStatus.PROCESSING ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          doc.status === DocumentStatus.INDEXING ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          doc.status === DocumentStatus.QUEUED ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {doc.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDownload(doc)}
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(doc.id)}
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
