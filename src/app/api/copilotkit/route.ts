import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-2.5-flash-preview-04-17",
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const runtime = new CopilotRuntime();

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: "/api/copilotkit",
});

export const POST = (req: NextRequest) => handleRequest(req);
export const GET = (req: NextRequest) => handleRequest(req);
