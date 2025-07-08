import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  ExperimentalEmptyAdapter,
  langGraphPlatformEndpoint,
} from "@copilotkit/runtime";
import { apiClient } from "@/lib/api-client";
import OpenAI from "openai";

const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  try {
    // Get user from headers
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return new Response("User ID required", { status: 401 });
    }

    // Set up API client with token from cookies
    const cookieHeader = req.headers.get("cookie");
    const accessToken = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("access_token="));

    if (!accessToken) {
      return new Response("Access token required", { status: 401 });
    }

    const token = accessToken.split("=")[1];
    apiClient.setToken(token);

    // Get user from API client
    const user = await apiClient.getUser(userId);

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
          agents: [
            {
              name: user.agent_name,
              description: "A helpful LLM agent.",
            },
          ],
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
