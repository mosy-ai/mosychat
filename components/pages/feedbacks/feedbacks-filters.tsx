import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbacksFiltersProps } from "./types";

export function FeedbacksFilters({
  filters,
  filterOptions,
  onFilterChange,
  onExport,
  isLoading,
}: FeedbacksFiltersProps) {
  return (
    <div className="flex flex-wrap justify-end mb-4 gap-2">
      <Select
        value={filters.user_id}
        onValueChange={(value) => onFilterChange("user_id", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by User..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          {filterOptions.users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name || user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.agent_id}
        onValueChange={(value) => onFilterChange("agent_id", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Agent..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Agents</SelectItem>
          {filterOptions.agents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.conversation_id}
        onValueChange={(value) => onFilterChange("conversation_id", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Conversation..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Conversations</SelectItem>
          {filterOptions.conversations.map((conv) => (
            <SelectItem key={conv.id} value={conv.id}>
              {conv.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.rating}
        onValueChange={(value) => onFilterChange("rating", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by Rating..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="1">Like</SelectItem>
          <SelectItem value="0">Dislike</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="default"
        size="sm"
        onClick={onExport}
        disabled={isLoading}
      >
        Export to xlsx
      </Button>
    </div>
  );
} 