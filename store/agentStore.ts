// store/useAgentStore.ts
import { create } from "zustand";
import { AgentResponse } from "@/lib/api-client";

// Define the shape of your store's state and actions
type AgentStore = {
  selectedAgent: AgentResponse | null;
  setSelectedAgent: (agent: AgentResponse | null) => void;
};

// Create the store
export const useAgentStore = create<AgentStore>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));
