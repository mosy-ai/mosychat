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
} from "@assistant-ui/react";
import { apiClient } from "@/lib/api-client";
import { AgentProvider, useAgent } from "@/context/AgentContext";
import UniversalAttachmentAdapter from "@/components/assistant-ui/provider/AllDocumentsAttachmentAdapter";

const NAMESPACE = process.env.NEXT_PUBLIC_NAMESPACE || NIL;

const feedbackAdapter: FeedbackAdapter = {
  async submit(feedback) {
    feedback;
  },
};

export function RuntimeCore({ children }: { children: React.ReactNode }) {
  const { selectedAgent } = useAgent();
  const refRemoteId = useRef("");
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () =>
      useLocalThreadRuntime(
        {
          async *run({ messages }) {
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
            const response = await apiClient.agents.chatStream(payload as any);

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
                yield {
                  content: [
                    {
                      type: "text",
                      text: text.replace(/<thinking>[\s\S]*?<\/thinking>/g, ""),
                    },
                  ],
                };
              }
            }
          },
        },
        {
          adapters: {
            feedback: feedbackAdapter,
            attachments: new CompositeAttachmentAdapter([
              new UniversalAttachmentAdapter(),
            ]),
          },
        }
      ),
    adapter: {
      async list() {
        const res = await apiClient.conversations.list();
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
        apiClient.conversations.create({
          title: "New Chat",
          id: threadId,
          agent_id: selectedAgent?.id || "",
        });
        refRemoteId.current = threadId;
        return { remoteId: threadId, externalId: threadId };
      },

      async rename(remoteId: string, newTitle: string) {
        await apiClient.conversations.update(remoteId, { title: newTitle });
      },

      async delete(remoteId: string) {
        await apiClient.conversations.delete(remoteId);
      },

      async generateTitle(remoteId: string, messages: any[]) {
        const title_req = await apiClient.conversations.generateTitle({
          conversation_id: remoteId,
          messages: messages.map((msg) => msg.content[0]?.text || ""),
        });
        const title = title_req.title;
        if (title) {
          await apiClient.conversations.update(remoteId, { title });
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
              const res = await apiClient.conversations.listMessages({
                conversation_id: remoteId,
              });

              for (const message of res.data) {
                let attachments = [];
                for (const attachment of message.attachments || []) {
                  const attachment_info = await apiClient.documents.get(
                    attachment
                  );
                  attachments.push({
                    id: attachment,
                    type: "document",
                    status: { type: "complete" },
                    name: attachment_info.file_name,
                    contentType: attachment_info.file_type,
                  });
                }
                message.attachments = attachments;
              }

              return {
                messages: (res.data || [])
                  .slice()
                  .reverse()
                  .map((m, i, arr) => ({
                    message: {
                      id: m.id,
                      role: m.role,
                      content: [
                        {
                          type: "text",
                          text: m.content.replace(
                            /<thinking>[\s\S]*?<\/thinking>/g,
                            ""
                          ),
                        },
                      ],
                      attachments: m.attachments,
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
              const maxRetries = 5;
              const retryWithCount = async (retryCount: number) => {
                try {
                  await apiClient.conversations.createMessage({
                    id: uuidv5(newMessage.id || NIL, NAMESPACE),
                    conversation_id:
                      refRemoteId.current || uuidv5(threadId, NAMESPACE),
                    attachments: newMessage.attachments,
                    role: newMessage.role,
                    content:
                      newMessage.content[0]?.text.replace(
                        /<thinking>[\s\S]*?<\/thinking>/g,
                        ""
                      ) || "",
                  });
                } catch (error) {
                  await apiClient.conversations.updateMessage(newMessage.id, {
                    content:
                      newMessage.content[0]?.text.replace(
                        /<thinking>[\s\S]*?<\/thinking>/g,
                        ""
                      ) || "",
                  });
                  if (retryCount < maxRetries) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    return retryWithCount(retryCount + 1);
                  }
                  throw new Error(
                    `Failed to append message after ${maxRetries} retries`
                  );
                }
              };
              return retryWithCount(0);
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


export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AgentProvider>
      <RuntimeCore>{children}</RuntimeCore>
    </AgentProvider>
  );
}
