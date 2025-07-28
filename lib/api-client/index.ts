import { BaseApiClient } from '@/lib/api-client/baseApiClient';
import { AgentService } from '@/lib/api-client/services/agent.service';
import { AuthService } from '@/lib/api-client/services/auth.service';
import { ConversationService } from '@/lib/api-client/services/conversation.service';
import { DocumentService } from '@/lib/api-client/services/document.service';
import { GroupService } from '@/lib/api-client/services/group.service';
import { KnowledgeBaseService } from '@/lib/api-client/services/knowledgeBase.service';
import { UserService } from '@/lib/api-client/services/user.service';

export * from '@/lib/api-client/types/agent.types';
export * from '@/lib/api-client/types/auth.types';
export * from '@/lib/api-client/types/base.types';
export * from '@/lib/api-client/types/conversation.types';
export * from '@/lib/api-client/types/document.types';
export * from '@/lib/api-client/types/group.types';
export * from '@/lib/api-client/types/knowledgeBase.types';
export * from '@/lib/api-client/types/user.types';

class ApiClient {
  private baseClient: BaseApiClient;

  public auth: AuthService;
  public users: UserService;
  public groups: GroupService;
  public documents: DocumentService;
  public knowledgeBases: KnowledgeBaseService;
  public agents: AgentService;
  public conversations: ConversationService;

  constructor() {
    this.baseClient = new BaseApiClient();
    this.auth = new AuthService(this.baseClient);
    this.users = new UserService(this.baseClient);
    this.groups = new GroupService(this.baseClient);
    this.documents = new DocumentService(this.baseClient);
    this.knowledgeBases = new KnowledgeBaseService(this.baseClient);
    this.agents = new AgentService(this.baseClient);
    this.conversations = new ConversationService(this.baseClient);
  }

  public setToken(token: string): void {
    this.baseClient.setToken(token);
  }
}

export const apiClient = new ApiClient();