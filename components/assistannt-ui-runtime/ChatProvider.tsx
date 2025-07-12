"use client";

import {
  type ChatModelAdapter,
} from "@assistant-ui/react";
import { apiClient } from "@/lib/api-client";

export const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages }) {
    
    const payload = {
      messages,
    }

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
  //   async run({ messages, abortSignal }) {
  //     // TODO replace with your own API
  //     const result = await fetch("http://65.21.203.12:8008/api/v1/agents/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         messages,
  //       }),
  //       signal: abortSignal,
  //     });
  //     const data = await result.json();
  //     console.log("Response from API:", data);
  //     return {
  //       content: [
  //         {
  //           type: "text",
  //           text: data.content
  //             .map((item: { type: string; text: string }) => item.text)
  //             .join(""),
  //         },
  //       ],
  //     };
  //   },
};
