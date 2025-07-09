/* app/(dashboard)/chat/page.tsx
 * Threaded chat with local message persistence.
 */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  CopilotKit,
  useCopilotChat, // headless hook
  useCopilotContext,
} from "@copilotkit/react-core";
import { MessagesProps } from "@copilotkit/react-ui";
import { CopilotChat } from "@copilotkit/react-ui";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Bot,
  AlertCircle,
  PlusCircle,
  Trash2,
  Loader2,
  Send,
  Square,
  Paperclip,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";


import "@copilotkit/react-ui/styles.css";
import { UserResponse } from "@/lib/api-client";
import { verifyAndGetMe } from "@/lib/custom-func";

/* ---------- feedback popup component ---------- */

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  type: 'up' | 'down';
  message: string;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  message,
}) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
    setFeedback("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'up' ? (
              <ThumbsUp className="h-5 w-5 text-green-500" />
            ) : (
              <ThumbsDown className="h-5 w-5 text-red-500" />
            )}
            {type === 'up' ? 'Positive Feedback' : 'Feedback'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Message:</Label>
            <ScrollArea className="h-24 w-full rounded-md border bg-muted/50 p-3 mt-2">
              <p className="text-sm text-muted-foreground">{message}</p>
            </ScrollArea>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium">
                {type === 'up' 
                  ? 'What did you like about this response?' 
                  : 'What could be improved?'}
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={type === 'up' 
                  ? 'Tell us what worked well...' 
                  : 'Tell us what could be better...'}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!feedback.trim()}>
                Submit
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- helpers ---------- */

type Thread = {
  id: string;
  title: string;
  used: boolean;
  createdAt: number;
};

const makeId = () => crypto.randomUUID();
const getThreadsKey = (email: string) => {
  // Simple hash function for demonstration (djb2)
  let hash = 5381;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) + hash + email.charCodeAt(i);
  }
  return `mosyai_threads_${hash}_v1`;
};

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
  const [threadsKey, setThreadsKey] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const userData = await verifyAndGetMe();
        setUser(userData);
        if (!userData.langgr_url || !userData.agent_name) {
          setConfigError(
            "Your agent configuration is not set. Please contact an administrator."
          );
        }
        // Set threads key based on user email
        if (userData.email) {
          const threadsKey = getThreadsKey(userData.email);
          setThreadsKey(threadsKey);
        } else {
          setConfigError("User email not found. Cannot initialize threads.");
        }
      } catch (err) {
        console.error("Failed to verify user:", err);
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

  // Only render chat UI when threadsKey is ready
  if (!threadsKey) {
    return (
      <div className="flex flex-col items-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        Initializing chat...
      </div>
    );
  }

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
      headers={{ "x-user-id": user.id }}
    >
      <ThreadedChat threadsKey={threadsKey} />
    </CopilotKit>
  );
};

/* ---------- threaded chat UI ---------- */

const ThreadedChat: React.FC<{ threadsKey: string }> = ({ threadsKey }) => {
  const { threadId: activeThreadId, setThreadId } = useCopilotContext();

  const [threads, setThreads] = useState<Thread[]>(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(threadsKey) || "[]"
      ) as Thread[];
      return stored.length
        ? stored
        : [
            {
              id: makeId(),
              title: "New thread",
              used: false,
              createdAt: Date.now(),
            },
          ];
    } catch {
      return [
        {
          id: makeId(),
          title: "New thread",
          used: false,
          createdAt: Date.now(),
        },
      ];
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
    localStorage.setItem(threadsKey, JSON.stringify(threads));
  }, [threads, threadsKey]);

  /* ---- CRUD helpers ---- */

  const markThreadUsed = useCallback((id: string, maybeTitle?: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id && !t.used
          ? {
              ...t,
              used: true,
              title: maybeTitle ? maybeTitle.slice(0, 50) : t.title,
            }
          : t
      )
    );
  }, []);

  const createThread = () => {
    const current = threads.find((t) => t.id === activeThreadId);
    if (current && !current.used) return; // prevent multiple blanks
    const newThread: Thread = {
      id: makeId(),
      title: "New thread",
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
      const remainingThreads = threads.filter((t) => t.id !== id);
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
    <div className="flex w-full overflow-hidden rounded-lg border bg-background">
      {/* sidebar */}
      <aside className="w-56 shrink-0 border-r p-3 space-y-2 overflow-y-auto">
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
            disableNew ? "cursor-not-allowed opacity-40" : "hover:bg-accent"
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
                  ? "bg-muted font-semibold"
                  : "cursor-pointer hover:bg-accent"
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
      <main className="flex-1 flex flex-col ">
        <Card className="flex-1 flex flex-col rounded-none border-none ">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">MosyAI Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {activeThread ? (
              <ThreadChatWindow
                threadId={activeThread.id}
                onFirstUserMessage={markThreadUsed}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[65vh]">
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
  const { visibleMessages, reset /* clear store */ } = useCopilotChat({
    id: threadId,
  });

  const firstRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(threadId);

  // Feedback popup state
  const [feedbackPopup, setFeedbackPopup] = useState<{
    isOpen: boolean;
    type: 'up' | 'down';
    message: string;
  }>({
    isOpen: false,
    type: 'up',
    message: '',
  });

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

  // Updated feedback handlers with popup
  function handleUp(message: { content: string }) {
    setFeedbackPopup({
      isOpen: true,
      type: 'up',
      message: message.content,
    });
  }

  function handleDown(message: { content: string }) {
    setFeedbackPopup({
      isOpen: true,
      type: 'down',
      message: message.content,
    });
  }

  const handleFeedbackSubmit = (feedback: string) => {
    const logData = {
      type: feedbackPopup.type,
      message: feedbackPopup.message,
      userFeedback: feedback,
      timestamp: new Date().toISOString(),
    };
    
    console.log('User feedback:', logData);
    
    // Close the popup
    setFeedbackPopup({ isOpen: false, type: 'up', message: '' });
  };

  const handleFeedbackClose = () => {
    setFeedbackPopup({ isOpen: false, type: 'up', message: '' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      <CopilotChat
        key={threadId} /* forces visual remount */
        className=" w-full rounded-lg"
        onSubmitMessage={handleSubmit}
        labels={{ placeholder: "Type your message here…" }}
        Messages={(props: MessagesProps) => (
          <div className="flex flex-col space-y-4 p-4 h-[65vh] overflow-auto">
            {props.messages.map((msg: any, index) => {
              const isCurrentMessage = index === props.messages.length - 1;

              return (
                <div
                  key={`${threadId}-${msg.id || index}`}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    <props.UserMessage message={msg.content} rawData={msg} />
                  ) : (
                    <props.AssistantMessage
                      message={msg.content}
                      rawData={msg}
                      isCurrentMessage={isCurrentMessage}
                      isLoading={props.inProgress && isCurrentMessage}
                      isGenerating={props.inProgress && isCurrentMessage}
                      onRegenerate={() => props.onRegenerate?.(msg.id)}
                      onCopy={props.onCopy}
                      onThumbsUp={props.onThumbsUp}
                      onThumbsDown={props.onThumbsDown}
                      markdownTagRenderers={props.markdownTagRenderers}
                    />
                  )}
                </div>
              );
            })}
            <div
              ref={(el) => {
                if (el) {
                  el.scrollIntoView({ behavior: "auto" });
                }
              }}
            />
          </div>
        )}
        Input={({ inProgress, onSend, isVisible = true, onStop, onUpload }) => {
          const [inputValue, setInputValue] = useState("");

          const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!inputValue.trim() || inProgress) return;

            const message = inputValue.trim();
            setInputValue("");

            try {
              await onSend(message);
            } catch (error) {
              console.error("Error sending message:", error);
            }
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          };

          if (!isVisible) return null;

          return (
            <div className="border-t p-3">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full min-h-[40px] max-h-[120px] p-2 pr-8 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-gray-400 bg-white text-size-sm"
                    disabled={inProgress}
                    rows={1}
                  />

                  {/* Upload button inside input */}
                  {onUpload && (
                    <button
                      type="button"
                      onClick={onUpload}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={inProgress}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {inProgress && onStop ? (
                    <button
                      type="button"
                      onClick={onStop}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Square className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || inProgress}
                      className="p-2 text-blue-500 hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          );
        }}
        onThumbsUp={handleUp}
        onThumbsDown={handleDown}
      />
      
      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={feedbackPopup.isOpen}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        type={feedbackPopup.type}
        message={feedbackPopup.message}
      />
    </>
  );
}