"use client";

import { useMemo, useRef, useEffect } from "react";
import { v5 as uuidv5, NIL } from "uuid";
import {
  useLocalThreadRuntime,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
  useThreadListItem,
  RuntimeAdapterProvider,
  ThreadHistoryAdapter,
  AssistantRuntimeProvider,
  FeedbackAdapter,
  CompositeAttachmentAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
} from "@assistant-ui/react";
import { apiClient } from "@/lib/api-client";

const NAMESPACE = process.env.NEXT_PUBLIC_NAMESPACE || NIL;

const feedbackAdapter: FeedbackAdapter = {
  async submit(feedback) {
    feedback;
  },
};

export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const refRemoteId = useRef("");
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () =>
      useLocalThreadRuntime(
        {
          async *run({ messages, runConfig }) {
            while (!refRemoteId.current) {
              console.warn("Waiting for threadId to be set...");
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
            const payload = {
              messages: messages.map((msg) => ({
                ...msg,
                conversation_id: refRemoteId.current,
              })),
            };

            // Use the agentChatStream method from apiClient
            const response = await apiClient.agentChatStream(payload as any);

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const stream = response.body?.getReader();

            let text = "";
            function decodeUnicodeEscapes(str: string): string {
              return str
                .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) =>
                  String.fromCharCode(parseInt(hex, 16))
                )
                .replace(/\\n/g, "\n");
            }
            if (stream) {
              while (true) {
                const { done, value } = await stream.read();
                if (done) break;
                const decoder = new TextDecoder();
                let chunk = decoder.decode(value, { stream: true });

                // You may need to adjust parsing depending on your backend's stream format
                let chunk_parts = chunk.split('0:"');
                let cleared = "";
                for (let i = 1; i < chunk_parts.length; i++) {
                  let part = chunk_parts[i];
                  part = decodeUnicodeEscapes(part.slice(0, -2));
                  cleared += part;
                }
                text += cleared;
                yield { content: [{ type: "text", text: text }] };
              }
            }
          },
        },
        {
          adapters: {
            feedback: feedbackAdapter,
            attachments: new CompositeAttachmentAdapter([
              new SimpleImageAttachmentAdapter(),
              new SimpleTextAttachmentAdapter(),
            ]),
          },
        }
      ),
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
        refRemoteId.current = threadId;
        return { remoteId: threadId, externalId: threadId };
      },

      async rename(remoteId: string, newTitle: string) {
        await apiClient.updateConversation(remoteId, { title: newTitle });
      },

      async delete(remoteId: string) {
        await apiClient.deleteConversation(remoteId);
      },

      async generateTitle(remoteId: string, messages: any[]) {
        const title_req = await apiClient.generateConversationTitle({
          conversation_id: remoteId,
          messages: messages.map((msg) => msg.content[0]?.text || ""),
        });
        const title = title_req.title;
        if (title) {
          await apiClient.updateConversation(remoteId, { title });
        }
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
        console.log("Thread List Item:", threadListItem);
        const remoteId = threadListItem.remoteId;
        const threadId = threadListItem.id;
        useEffect(() => {
          refRemoteId.current = remoteId || "";
        }, [remoteId]);
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
                      attachments: [],
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
              const newMessage = message.message;
              try {
                await apiClient.createMessage({
                  id: uuidv5(newMessage.id || NIL, NAMESPACE),
                  conversation_id: refRemoteId.current || uuidv5(threadId, NAMESPACE),
                  role: newMessage.role,
                  content: newMessage.content[0]?.text || "",
                });
              } catch (error) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                console.warn("Retrying message append");
                this.append(message);
              }
            },
          }),
          [remoteId]
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
