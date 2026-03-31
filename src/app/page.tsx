"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Shield, FileSearch, MessageSquare, X } from "lucide-react";

import UploadZone from "@/components/UploadZone";
import RevenueTable from "@/components/RevenueTable";
import ContractSummary from "@/components/ContractSummary";
import { MOCK_RESULT } from "@/lib/mock-data";
import { ExtractionResult, ExtractionResultSchema } from "@/lib/types";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const ASC606_INSTRUCTIONS = `You are a senior GAAP revenue recognition auditor specializing in ASC 606.

The full contract text is available in your context under "contract_text".

When the user asks you to analyze the contract or generate a revenue schedule:
1. Identify all performance obligations (subscriptions, licenses, professional services, support)
2. Classify each as "over-time" (straight-line) or "point-in-time"
3. Extract dollar amounts and dates — cite [Section X.Y, Page N] for every figure
4. Assign confidence scores 0-100 based on how explicit the document is
5. Call the generate_revenue_schedule action with the structured extraction result

For follow-up questions, answer directly from the contract text in context.
Always cite specific sections and page numbers. Never guess — if uncertain, say so and lower the confidence score.`;

function AuditorApp() {
  const [contractText, setContractText] = useState<string | null>(
    MOCK_MODE ? "Mock contract text loaded." : null
  );
  const [fileName, setFileName] = useState<string | null>(
    MOCK_MODE ? "mock-contract.pdf" : null
  );
  const [pageCount, setPageCount] = useState<number | null>(
    MOCK_MODE ? 82 : null
  );
  const [result, setResult] = useState<ExtractionResult | null>(
    MOCK_MODE ? MOCK_RESULT : null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);

  useCopilotReadable({
    description: "Full text of the uploaded revenue contract",
    value: contractText ?? "No contract uploaded yet. Ask the user to upload a PDF.",
  });

  useCopilotAction({
    name: "generate_revenue_schedule",
    description:
      "Generate and display a GAAP ASC 606 revenue recognition schedule from the contract",
    parameters: [
      {
        name: "result",
        type: "object",
        description: "The full extraction result conforming to ExtractionResult schema",
        required: true,
      },
    ],
    render: ({ status, args }) => {
      if (status === "inProgress") {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Generating revenue recognition schedule…
          </div>
        );
      }
      const parsed = ExtractionResultSchema.safeParse(args.result);
      if (!parsed.success) {
        return (
          <p className="text-sm text-red-400">
            Could not parse extraction result. Check console for details.
          </p>
        );
      }
      return (
        <div className="space-y-4 my-2">
          <ContractSummary
            contract={parsed.data.contract}
            citations={parsed.data.rawCitations}
          />
          <RevenueTable schedule={parsed.data.schedule} />
          {parsed.data.extractionNote && (
            <p className="text-xs text-slate-500 italic">{parsed.data.extractionNote}</p>
          )}
        </div>
      );
    },
    handler: async ({ result: rawResult }) => {
      const parsed = ExtractionResultSchema.safeParse(rawResult);
      if (parsed.success) setResult(parsed.data);
    },
  });

  const handleParsed = (text: string, pages: number, name: string) => {
    setContractText(text);
    setPageCount(pages);
    setFileName(name);
    setResult(null);
    setUploadError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight">Revenue Recognition Auditor</h1>
          <p className="text-xs text-slate-400">ASC 606 — GAAP Compliant</p>
        </div>

        {MOCK_MODE && (
          <span className="ml-4 text-xs font-mono px-2 py-1 rounded border border-amber-700/50 bg-amber-900/30 text-amber-400">
            MOCK MODE
          </span>
        )}

        {fileName && !MOCK_MODE && (
          <div className="flex items-center gap-2 text-xs text-slate-400 ml-4">
            <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-medium">{fileName}</span>
            {pageCount && <span className="text-slate-500">({pageCount} pages)</span>}
          </div>
        )}

        {/* Chat toggle */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          {chatOpen ? <X className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
          {chatOpen ? "Close Chat" : "Open Chat"}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Output panel — fills remaining space, scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Upload zone */}
            {!MOCK_MODE && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Contract Document
                </p>
                <UploadZone
                  onParsed={handleParsed}
                  onError={setUploadError}
                  disabled={false}
                />
                {uploadError && (
                  <p className="mt-2 text-xs text-red-400">{uploadError}</p>
                )}
                {contractText && !result && (
                  <p className="mt-3 text-xs text-slate-400 bg-slate-800 rounded px-3 py-2 border border-slate-700">
                    Contract loaded. Ask the AI to &quot;analyze this contract&quot; in the chat.
                  </p>
                )}
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                <ContractSummary
                  contract={result.contract}
                  citations={result.rawCitations}
                />
                <RevenueTable schedule={result.schedule} />
              </>
            )}

            {/* Empty state */}
            {!contractText && !MOCK_MODE && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                <FileSearch className="w-14 h-14 mb-4 opacity-20" />
                <p className="text-base font-medium text-slate-400">Upload a contract PDF to begin</p>
                <p className="text-sm mt-1 opacity-60">Supports contracts up to 82+ pages</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel — inline, fixed width, collapsible */}
        {chatOpen && (
          <div className="w-[420px] shrink-0 border-l border-slate-800 flex flex-col overflow-hidden">
            <CopilotChat
              className="flex flex-col h-full"
              labels={{
                title: "Revenue Audit Assistant",
                initial: contractText
                  ? `Contract loaded (${pageCount} pages). Ask me to:\n• "Analyze this contract"\n• "What are the performance obligations?"\n• "Generate the revenue recognition schedule"\n• "What is the total contract value?"`
                  : "Upload a contract PDF on the left to begin. I\u2019ll help you generate an ASC 606 revenue recognition schedule.",
              }}
              instructions={ASC606_INSTRUCTIONS}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <AuditorApp />
    </CopilotKit>
  );
}
