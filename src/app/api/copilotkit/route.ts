export const maxDuration = 60; // Allows the function to run for up to 60 seconds

import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env.local.",
  );
}

const serviceAdapter = new GoogleGenerativeAIAdapter({
  model: "gemini-2.5-flash-preview-04-17",
  apiKey,
});

const runtime = new CopilotRuntime();

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter,
  endpoint: "/api/copilotkit",
});

export const POST = (req: NextRequest) => handleRequest(req);
export const GET = (req: NextRequest) => handleRequest(req);
