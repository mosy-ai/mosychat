"use client";

import { useMemo } from "react";
import { v5 as uuidv5, NIL } from "uuid";
import {
  useLocalThreadRuntime,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
  useThreadListItem,
  RuntimeAdapterProvider,
  AssistantRuntimeProvider,
  ThreadHistoryAdapter,
  FeedbackAdapter,
} from "@assistant-ui/react";
import { MyModelAdapter } from "@/components/assistannt-ui-runtime/ChatProvider";
import { apiClient } from "@/lib/api-client";

const NAMESPACE = process.env.NEXT_PUBLIC_NAMESPACE || NIL;

const feedbackAdapter: FeedbackAdapter = {
  async submit(feedback) {
    apiClient.createFeedback({
      id: feedback.message.id,
      message_id: feedback.message.id,
      rating: feedback.type === "positive" ? 1 : 0,
    });
    console.log("Feedback submitted:", feedback);
  },
};

export function MyRuntimeProvider({ children }: { children: React.ReactNode }) {
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () =>
      useLocalThreadRuntime(MyModelAdapter, {
        adapters: {
          feedback: feedbackAdapter,
        },
      }),
    adapter: {
      async list() {
        const res = await apiClient.listConversations();
        return {
          threads: (res.data || []).map((t) => ({
            status: "regular",
            remoteId: t.id,
            title: t.title,
          })),
        };
      },

      async initialize(_threadId: string) {
        const threadId = uuidv5(_threadId, NAMESPACE);
        apiClient.createConversation({
          title: "New Chat",
          id: threadId,
        });
        return { remoteId: threadId, externalId: threadId };
      },

      async rename(remoteId: string, newTitle: string) {
        await apiClient.updateConversation(remoteId, { title: newTitle });
      },

      async delete(remoteId: string) {
        await apiClient.deleteConversation(remoteId);
      },

      async generateTitle(remoteId: string, messages: any[]) {
        return new ReadableStream();
      },

      async archive(remoteId: string) {
        console.warn("Archiving is not implemented in this adapter.");
      },

      async unarchive(remoteId: string) {
        console.warn("Unarchiving is not implemented in this adapter.");
      },
      unstable_Provider: ({ children }) => {
        const threadListItem = useThreadListItem();
        const remoteId = threadListItem.remoteId;
        const localId = threadListItem.id;

        // Message history adapter for each thread
        const history = useMemo<ThreadHistoryAdapter>(
          () => ({
            async load(): Promise<{ messages: any[] }> {
              if (!remoteId) return { messages: [] };
              const res = await apiClient.listMessages({
                conversation_id: remoteId,
              });

              return {
                messages: (res.data || [])
                  .slice()
                  .reverse()
                  .map((m, i, arr) => ({
                    message: {
                      id: m.id,
                      role: m.role,
                      content: [{ type: "text", text: m.content }],
                      threadId: remoteId,
                      status: "regular",
                      metadata: {},
                      createdAt: new Date(m.created_at),
                    },
                    parentId: i > 0 ? arr[i - 1].id : null,
                  })),
              };
            },

            async append(message: any) {
              const rId = remoteId || uuidv5(localId, NAMESPACE);
              message = message.message;
              await apiClient.createMessage({
                conversation_id: rId,
                role: message.role,
                content: message.content[0]?.text || "",
              });
            },
          }),
          [remoteId, localId]
        );

        const adapters = useMemo(() => ({ history }), [history]);

        return (
          <RuntimeAdapterProvider adapters={adapters}>
            {children}
          </RuntimeAdapterProvider>
        );
      },
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
