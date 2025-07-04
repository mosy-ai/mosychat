/* app/(dashboard)/chat/page.tsx
 * Threaded chat with local message persistence.
 */
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  CopilotKit,
  useCopilotChat,            // headless hook
  useCopilotContext 
} from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';

import { DashboardLayout } from '@/components/dashboard-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Bot,
  AlertCircle,
  PlusCircle,
  Trash2,
  Loader2,
} from 'lucide-react';

import '@copilotkit/react-ui/styles.css';
import { UserResponse } from '@/lib/api-client';
import { verifyAndGetMe } from '@/lib/custom-func';

/* ---------- helpers ---------- */

type Thread = {
  id: string;
  title: string;
  used: boolean;
  createdAt: number;
};

const makeId = () => crypto.randomUUID(); /* all evergreen browsers support this ﻿cite﻿turn0search0﻿ */
const THREADS_KEY = 'mosyai_threads_v1';

/* ---------- page ---------- */

export default function ChatPage() {
  return (
    <DashboardLayout>
      <AgenticChat />
    </DashboardLayout>
  );
}

/* ---------- auth / provider wrapper ---------- */

const AgenticChat: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const userData = await verifyAndGetMe();
        setUser(userData);
        if (!userData.langgr_url || !userData.agent_name) {
          setConfigError(
            'Your agent configuration is not set. Please contact an administrator.',
          );
        }
      } catch (err) {
        console.error('Failed to verify user:', err);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        Loading chat...
      </div>
    );
  }
  if (!user) return <div>User not authenticated</div>;
  if (configError) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Configuration Required
            </h3>
            <p className="text-muted-foreground">{configError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      agent={user.agent_name || 'default-agent'}
      headers={{ 'x-user-id': user.id }}
    >
      <ThreadedChat />
    </CopilotKit>
  );
};

/* ---------- threaded chat UI ---------- */

const ThreadedChat: React.FC = () => {
  const { threadId: activeThreadId, setThreadId } = useCopilotContext();
  
  const [threads, setThreads] = useState<Thread[]>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(THREADS_KEY) || '[]',
      ) as Thread[];
      return stored.length
        ? stored
        : [{ id: makeId(), title: 'New thread', used: false, createdAt: Date.now() }];
    } catch {
      return [{ id: makeId(), title: 'New thread', used: false, createdAt: Date.now() }];
    }
  });

  // Initialize threadId if not set
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setThreadId(threads[0].id);
    }
  }, [activeThreadId, setThreadId, threads]);

  /* persist thread list */
  useEffect(() => {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  }, [threads]);

  /* ---- CRUD helpers ---- */

  const markThreadUsed = useCallback(
    (id: string, maybeTitle?: string) => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === id && !t.used
            ? { ...t, used: true, title: maybeTitle ? maybeTitle.slice(0, 50) : t.title }
            : t,
        ),
      );
    },
    [],
  );

  const createThread = () => {
    const current = threads.find((t) => t.id === activeThreadId);
    if (current && !current.used) return; // prevent multiple blanks
    const newThread: Thread = {
      id: makeId(),
      title: 'New thread',
      used: false,
      createdAt: Date.now(),
    };
    setThreads([newThread, ...threads]);
    setThreadId(newThread.id);
  };

  const deleteThread = (id: string) => {
    // Prevent removing the only thread
    if (threads.length <= 1) {
      return;
    }
    
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      return next;
    });
    
    // Move these state updates outside the setThreads callback to avoid setState during render
    if (id === activeThreadId) {
      // Find the next thread to select after deletion
      const remainingThreads = threads.filter(t => t.id !== id);
      if (remainingThreads.length > 0) {
        // Use setTimeout to push this to the next event loop tick
        setTimeout(() => {
          setThreadId(remainingThreads[0].id);
        }, 0);
      }
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const disableNew = activeThread ? !activeThread.used : false;

  /* ---- render ---- */
  return (
    <div className="flex h-[90vh] w-full overflow-hidden rounded-lg border bg-background">
      {/* sidebar */}
      <aside className="w-56 shrink-0 border-r p-3 space-y-2 overflow-y-auto">
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
            disableNew ? 'cursor-not-allowed opacity-40' : 'hover:bg-accent'
          }`}
          onClick={createThread}
          disabled={disableNew}
        >
          <PlusCircle className="h-4 w-4" />
          New&nbsp;thread
        </button>

        <ul className="space-y-1 pt-2">
          {threads.map((t) => (
            <li
              key={t.id}
              className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm ${
                t.id === activeThreadId
                  ? 'bg-muted font-semibold'
                  : 'cursor-pointer hover:bg-accent'
              }`}
            >
              <span
                className="truncate flex-1"
                onClick={() => setThreadId(t.id)}
                title={t.title}
              >
                {t.title}
              </span>
              <Trash2
                className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                onClick={() => deleteThread(t.id)}
              />
            </li>
          ))}
        </ul>
      </aside>

      {/* chat pane */}
      <main className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col rounded-none border-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">MosyAI Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {activeThread ? (
              <ThreadChatWindow
                threadId={activeThread.id}
                onFirstUserMessage={markThreadUsed}
              />
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                   Please select a thread to start chatting.
                  
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

/* ---------- chat window with localStorage hydrate ---------- */

function ThreadChatWindow({
  threadId,
  onFirstUserMessage,
}: {
  threadId: string;
  onFirstUserMessage: (id: string, title?: string) => void;
}) {
  const {
    visibleMessages,
    reset,            /* clear store */
  } = useCopilotChat({ id: threadId });

  const firstRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(threadId);

  /* Reset chat when switching threads */
  useEffect(() => {
    if (threadId !== currentThreadId) {
      setIsLoading(true);
      firstRef.current = false;
      setCurrentThreadId(threadId);
      reset();
    }
  }, [threadId, currentThreadId, reset]);

  /* Hide loading when messages are ready */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading && threadId === currentThreadId) {
      // Small delay to ensure UI is properly reset
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, threadId, currentThreadId, visibleMessages]);

  /* Mark thread "used" on first user message */
  const handleSubmit = (text: string) => {
    if (!firstRef.current) {
      firstRef.current = true;
      onFirstUserMessage(threadId, text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <CopilotChat
      key={threadId}                  /* forces visual remount */
      className="h-full w-full rounded-lg"
      onSubmitMessage={handleSubmit}
      labels={{ placeholder: 'Type your message here…' }}
    />
  );
}
