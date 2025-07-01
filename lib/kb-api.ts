const KB_API_BASE = 'http://160.25.89.227:8887';
const USER_ID = '77777777-ad9f-4e87-a2db-8daa31953062';

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBaseCreateDto {
  name: string;
  description?: string;
}

export interface KnowledgeBaseUpdateDto {
  name?: string;
  description?: string;
}

class KBApiClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${KB_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Knowledge Base operations
  async listKnowledgeBases(page = 1, limit = 10, orderBy = 'created_at', order = 'desc') {
    return this.makeRequest(`/knowledge-bases?page=${page}&limit=${limit}&order_by=${orderBy}&order=${order}`);
  }

  async createKnowledgeBase(data: KnowledgeBaseCreateDto) {
    console.log('Creating knowledge base:', data.name, 'User ID:', USER_ID);
    return this.makeRequest('/knowledge-bases', {
      method: 'POST',
      headers: { 'x_user_id': USER_ID },
      body: JSON.stringify(data),
    });
  }

  async getKnowledgeBase(id: string) {
    return this.makeRequest(`/knowledge-bases/${id}`);
  }

  async updateKnowledgeBase(id: string, data: KnowledgeBaseUpdateDto) {
    return this.makeRequest(`/knowledge-bases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKnowledgeBase(id: string) {
    return this.makeRequest(`/knowledge-bases/${id}`, {
      method: 'DELETE',
    });
  }

  // Document operations
  async listDocuments(page = 1, size = 10, orderBy = 'created_at', order = 'desc', statuses: string[] = []) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      order_by: orderBy,
      order: order,
    });
    
    statuses.forEach(status => params.append('statuses', status));
    
    return this.makeRequest(`/documents?${params}`);
  }

  async uploadDocument(file: File, knowledgeBaseId: string) {
    console.log('Uploading document:', file.name, 'User ID:', USER_ID);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_dto', JSON.stringify({
      knowledge_base_id: knowledgeBaseId,
    }));

    const response = await fetch(`${KB_API_BASE}/documents`, {
      method: 'POST',
      headers: { 'x_user_id': USER_ID },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getDocument(id: string) {
    return this.makeRequest(`/documents/${id}`);
  }

  async deleteDocument(id: string) {
    return this.makeRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDocument(id: string, data: any) {
    return this.makeRequest(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async downloadDocument(id: string) {
    const response = await fetch(`${KB_API_BASE}/documents/${id}/raw`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return response.blob();
  }
}

export const kbApi = new KBApiClient();
