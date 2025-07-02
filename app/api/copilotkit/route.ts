import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
  langGraphPlatformEndpoint,
} from "@copilotkit/runtime";
import { findUserByUsername, initDB } from '@/lib/db'

const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  try {
    // Get user from headers
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return new Response("User ID required", { status: 401 });
    }

    await initDB();
    const user = await findUserByUsername(userId);
    
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Check if user has agent configuration
    if (!user.langgr_url || !user.agent_name) {
      return new Response("User agent configuration not set", { status: 400 });
    }

    // Create runtime with user-specific configuration
    const runtime = new CopilotRuntime({
      remoteEndpoints: [
        langGraphPlatformEndpoint({
          deploymentUrl: user.langgr_url,
          langsmithApiKey: process.env.LANGSMITH_API_KEY || "", 
          agents: [{
            name: user.agent_name,
            description: 'A helpful LLM agent.'
          }]
        }),
      ],
    });

    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });

    return handleRequest(req);
  } catch (error) {
    console.error("CopilotKit error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
