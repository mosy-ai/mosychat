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
} from "@assistant-ui/react";
import { apiClient } from "@/lib/api-client";

const NAMESPACE = process.env.NEXT_PUBLIC_NAMESPACE || NIL;

const feedbackAdapter: FeedbackAdapter = {
  async submit(feedback) {
    // open prompt to get user comment
    
    const comment = prompt("Please provide your feedback comment:");
    if (comment === null) {
      return; // User cancelled the prompt
    }

  
    apiClient.createFeedback({
      message_id: uuidv5(feedback.message.id || NIL, NAMESPACE),
      rating: feedback.type === "positive" ? 1 : 0,
      comment: comment,
    });
  },
};


export function MyRuntimeProvider({ children }: { children: React.ReactNode }) {
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
        await apiClient.createConversation({
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
        return new ReadableStream(
          
        );
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
              while (!refRemoteId.current) {
                console.warn("Waiting for remoteId to be set...");
                console.log(refRemoteId.current);
                await new Promise((resolve) => setTimeout(resolve, 100));
              }
              message = message.message;
              await apiClient.createMessage({
                id: uuidv5(message.id || NIL, NAMESPACE),
                conversation_id: refRemoteId.current,
                role: message.role,
                content: message.content[0]?.text || "",
              });
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
