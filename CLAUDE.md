# Revenue Recognition Agent: Project Memory

## Project Overview

An AI-powered auditor and chat assistant that parses complex revenue contracts (e.g., 82-page SEC filings) to perform GAAP-compliant (ASC 606) revenue recognition.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Agentic UI:** CopilotKit (v1.x) for Chat and Generative UI
- **AI Engine:** Gemini 2.5 Flash (Primary for 1M+ context window)
- **PDF Parsing:** `pdf-parse`
- **Styling:** Tailwind CSS + Shadcn/UI + Lucide Icons

## CopilotKit Implementation Patterns

- **Provider:** Wrap the layout in `<CopilotKit runtimeUrl="/api/copilotkit">`.
- **Chat UI:** Use `<CopilotChat />` for the main interaction.
- **Generative UI:** Use `useCopilotAction` to render the `RevenueTable` and `ContractSummary` components directly in the chat stream.
- **Context:** Use `useCopilotReadable` to feed extracted PDF text into the agent's context window.
- **Protocol:** Use the CopilotKit `GeminiAdapter` for the backend runtime.

## Core Logic: ASC 606 (Revenue Recognition)

1. **Performance Obligations (POBs):** Identify "Subscriptions" (Over-time) vs. "Services/Setup" (Point-in-time).
2. **Transaction Price:** Distinguish between base fees, implementation fees, and variable consideration.
3. **Recognition Logic:**
   - **Subscriptions:** Monthly straight-line ($Total / Duration$).
   - **Services:** Recognized upon completion/milestone.
4. **Verification Loop:** Agent MUST verify $\sum \text{Recognized Revenue} = \text{Total Contract Value}$ before rendering.

## UI & Feature Requirements

- **Chat Interface:** Primary entry point for file upload and auditing.
- **Interactive Table:** The agent must render a "Revenue Recognition Schedule" within the chat or as a side panel.
- **Salient Features:** Sidebar or chat-action displaying Payment Cycles (Net 30/60), Renewals, and Termination.
- **Citations:** Every explanation MUST cite specific Sections/Pages from the contract.
- **Stateless:** No DB. Process all data in-memory within the session.

## Development Commands

- Install: `npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime @google/generative-ai pdf-parse`
- Dev: `npm run dev`
- Mocking: Use `lib/mock-contract.ts` for UI styling to avoid hitting Gemini rate limits.

## Ignore Folders

- `.next/`, `node_modules/`, `dist/`.
