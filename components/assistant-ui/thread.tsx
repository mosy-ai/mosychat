import { v5 as uuidv5, NIL } from "uuid";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
  useMessageRuntime,
} from "@assistant-ui/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ComposerAttachments,
  ComposerAddAttachment,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import type { FC } from "react";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  SendHorizontalIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
} from "lucide-react";
import { IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { apiClient, AgentResponse } from "@/lib/api-client";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { FeedbackPopup } from "@/components/mosy-ui/feedback-popup";
import { useAgentStore } from "@/store/agentStore";

import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify)
  .use(remarkGfm);

const NAMESPACE = process.env.NEXT_PUBLIC_NAMESPACE || NIL;

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="bg-background box-border flex h-full flex-col overflow-hidden"
      style={{
        ["--thread-max-width" as string]: "42rem",
      }}
    >
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <ThreadWelcome />
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="flex w-full flex-grow flex-col items-center justify-center gap-4">
          <p className="text-lg font-medium">How can I help you today?</p>
          <p className="text-sm text-muted-foreground">
            Select an agent to get started.
          </p>
          <AgentSelector />
        </div>
      </div>
    </ThreadPrimitive.Empty>
  );
};

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
      <ComposerAttachments />
      <ComposerAddAttachment />
      <ComposerPrimitive.Input
        autoFocus
        rows={1}
        placeholder="Write a message..."
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">
      <UserMessageAttachments />
      <div className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
        <MessagePrimitive.Content />
      </div>
      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  return (
    <MessagePrimitive.Root className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
      <div className="text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
            <IconUser />
          </div>
          <p className="text-sm text-muted-foreground">{selectedAgent?.name}</p>
        </div>
        <MessagePrimitive.Content
          components={{
            Empty: () => (
              <>
                <div className="flex items-center gap-2 py-4">
                  <svg
                    className="animate-spin h-5 w-5 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <div className="flex flex-col items-start">
                    {(() => {
                      const sentences = ["Thinking", "Searching", "Handling"];
                      const [index, setIndex] = useState(0);
                      const [dots, setDots] = useState(1);

                      useEffect(() => {
                        const interval = setInterval(() => {
                          setDots((prev) => {
                            if (prev < 2) return prev + 1;
                            setIndex((i) => (i + 1) % sentences.length);
                            return 1;
                          });
                        }, 1000);
                        return () => clearInterval(interval);
                      }, []);

                      return (
                        <p className="text-xs text-muted-foreground/70 animate-pulse">
                          {sentences[index]}.{".".repeat(dots)}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </>
            ),
            Text: ({ type, text }) => {
              const [html, setHtml] = useState<string>("");

              useEffect(() => {
                (async () => {
                  const file = await processor.process(text);
                  setHtml(String(file));
                })();
              }, [text]);

              return (
                html && (
                  <div
                    className="mosy-style"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                )
              );
            },
          }}
        />
        <MessageError />
      </div>
      <AssistantActionBar />
      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="border-destructive bg-destructive/10 dark:text-red-200 dark:bg-destructive/5 text-destructive mt-2 rounded-md border p-3 text-sm">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantActionBar: FC = () => {
  const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative">(
    "positive"
  );
  const messageRuntime = useMessageRuntime();
  const originalMessage = useMessage();
  const handleFeedbackClick = useCallback((type: "positive" | "negative") => {
    setFeedbackType(type);
    setFeedbackPopupOpen(true);
  }, []);

  const handleFeedbackSubmit = useCallback(
    async (comment: string) => {
      try {
        let message_id = originalMessage.id;
        if (originalMessage.id.length < 36) {
          message_id = uuidv5(originalMessage.id, NAMESPACE);
        }
        apiClient.conversations.createFeedback({
          message_id,
          rating: feedbackType === "positive" ? 1 : 0,
          comment,
        });
        setFeedbackPopupOpen(false);
        setFeedbackType("positive"); // Reset to default after submission
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    },
    [messageRuntime, feedbackType]
  );

  const handleFeedbackClose = useCallback(() => {
    setFeedbackPopupOpen(false);
  }, []);

  return (
    <>
      <ActionBarPrimitive.Root
        hideWhenRunning
        autohide="not-last"
        autohideFloat="single-branch"
        className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
      >
        <ActionBarPrimitive.Copy asChild>
          <TooltipIconButton tooltip="Copy">
            <MessagePrimitive.If copied>
              <CheckIcon />
            </MessagePrimitive.If>
            <MessagePrimitive.If copied={false}>
              <CopyIcon />
            </MessagePrimitive.If>
          </TooltipIconButton>
        </ActionBarPrimitive.Copy>

        {/* Custom feedback buttons that open popup */}
        <TooltipIconButton
          tooltip="Like"
          onClick={() => handleFeedbackClick("positive")}
        >
          <ThumbsUpIcon />
        </TooltipIconButton>
        <TooltipIconButton
          tooltip="Dislike"
          onClick={() => handleFeedbackClick("negative")}
        >
          <ThumbsDownIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Root>

      <FeedbackPopup
        isOpen={feedbackPopupOpen}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        feedbackType={feedbackType}
      />
    </>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground inline-flex items-center text-xs",
        className
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};

const AgentSelector: FC = () => {
  // --- FIX APPLIED HERE ---
  // Select each piece of state individually to avoid creating new objects on every render.
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const setSelectedAgent = useAgentStore((state) => state.setSelectedAgent);
  // --- END OF FIX ---

  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiClient.agents
      .list()
      .then((res) => {
        const agentData = res.data || [];
        setAgents(agentData);
        if (!selectedAgent && agentData.length > 0) {
          setSelectedAgent(agentData[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch agents:", err))
      .finally(() => setIsLoading(false));
  }, []); // This effect correctly runs only once.

  const handleValueChange = (agentId: string) => {
    const agentToSelect = agents.find((agent) => agent.id === agentId);
    if (agentToSelect) {
      setSelectedAgent(agentToSelect);
    }
  };

  return (
    <Select
      value={selectedAgent?.id || ""}
      onValueChange={handleValueChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an agent..." />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading agents...
          </SelectItem>
        ) : (
          agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default AgentSelector;
