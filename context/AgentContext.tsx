// src/context/AgentContext.tsx
"use client";

import { apiClient } from "@/lib/api-client";
import type { AgentResponse } from "@/lib/api-client/types/agent.types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

// Define the shape of the context data
interface AgentContextType {
  agents: AgentResponse[];
  selectedAgent: AgentResponse | null;
  setSelectedAgent: Dispatch<SetStateAction<AgentResponse | null>>;
  isLoading: boolean;
}

// Create the context with a default undefined value
const AgentContext = createContext<AgentContextType | undefined>(undefined);

// Create the provider component
export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the list of agents when the provider mounts
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.agents.list();
        if (response.data) {
          setAgents(response.data);
          // Optionally, set a default agent
          if (response.data.length > 0) {
            setSelectedAgent(response.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const value = { agents, selectedAgent, setSelectedAgent, isLoading };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};

// Create a custom hook for easy consumption of the context
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
};