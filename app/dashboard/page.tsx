"use client";

import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { RuntimeProvider } from "@/components/assistant-ui/provider/RuntimeProvider";

export default function Dashboard() {

  return (
    <>
      <RuntimeProvider>
        <div className="h-[85vh] flex flex-col md:grid md:grid-cols-[200px_1fr] px-4">
          <ThreadList />
          <Thread />
        </div>
      </RuntimeProvider>
    </>
  );
}
