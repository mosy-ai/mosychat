import type { FC } from "react";
import { useState } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from "@assistant-ui/react";
import { PlusIcon, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { IconSelector } from"@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const ThreadList: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-stretch gap-1.5 overflow-auto h-[calc(100vh-100px)]">
      {/* Mobile Collapsible Version */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 text-start"
            >
              <span className="flex items-center gap-2">
                <IconSelector className="h-4 w-4" />
                Threads
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-1.5 absolute bg-white shadow-xl p-2 rounded-lg z-50">
            <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
              <ThreadListNew />
              <ThreadListItems />
            </ThreadListPrimitive.Root>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop Version (always visible) */}
      <div className="hidden md:flex md:flex-col md:items-stretch md:gap-1.5">
        <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
          <ThreadListNew />
          <ThreadListItems />
        </ThreadListPrimitive.Root>
      </div>
    </div>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button className="data-[active]:bg-muted hover:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start" variant="ghost">
        <PlusIcon />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="data-[active]:bg-muted hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2">
      <ThreadListItemPrimitive.Trigger className="flex-grow px-3 py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete asChild>
        <TooltipIconButton
          className="hover:text-destructive text-foreground ml-auto mr-3 size-4 p-0"
          variant="ghost"
          tooltip="Delete thread"
        >
          <Trash2 />
        </TooltipIconButton>
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </p>
  );
};
