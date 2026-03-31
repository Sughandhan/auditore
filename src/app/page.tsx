"use client";

import { useState, useEffect } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Shield, FileSearch, MessageSquare, X } from "lucide-react";

import UploadZone from "@/components/UploadZone";
import RevenueTable from "@/components/RevenueTable";
import ContractSummary from "@/components/ContractSummary";
import SalientFeaturesCard from "@/components/SalientFeatures";
import { MOCK_RESULT } from "@/lib/mock-data";
import {
  ContractData,
  ExtractionResult,
  ExtractionResultSchema,
  SalientFeatures,
  SalientFeaturesSchema,
} from "@/lib/types";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const ASC606_INSTRUCTIONS = `You are a senior GAAP revenue recognition auditor specializing in ASC 606.

The full contract text is in your context under "contract_text".

RESPONSE MODES — choose exactly ONE per message:

MODE 1 — SALIENT FEATURES CARD
Call show_salient_features when the user:
- Asks to summarize or explain the contract
- Asks about payment terms, billing, renewal, termination, or governing law
- Says "tell me about this contract" or "what are the key terms"
Extract the data from the contract and call show_salient_features with structured fields.

MODE 2 — REVENUE SCHEDULE
Call generate_revenue_schedule ONLY when the user explicitly asks for:
- The revenue recognition schedule
- The ASC 606 table or breakdown
- "Generate the schedule" or "show me the revenue table"
Do NOT call this action for general questions. Populate all fields — contract, schedule, rawCitations.
IMPORTANT: Call the action IMMEDIATELY with no preceding text. Do not write "I'll generate..." or any intro — just call the action directly.

MODE 3 — PLAIN TEXT Q&A
For all other questions, answer in plain text.
MANDATORY CITATIONS: Every factual claim MUST be followed immediately by a citation in brackets.
Format: [Section X.Y, Page N] or [Page N] if no section number applies.
Example: "The customer may terminate with 30 days written notice [Section 12.3, Page 18]."
Do not state any fact without a citation. If you cannot find support in the contract, say "I could not find this in the contract" — never guess.
Keep answers concise. Do not repeat the same citation twice in a row.

NEVER call both actions in the same response.

CRITICAL field rules (for both actions):
- All monetary values → plain numbers, no commas or $ symbols (e.g. 3800000)
- Dates → YYYY-MM-DD strings
- obligation/lineItem type → "over-time" or "point-in-time" (never "recurring" or "one-time")
- schedule.isBalanced → true only if totalRecognized equals contractValue within $0.01`;

function AuditorApp() {
  const [contractText, setContractText] = useState<string | null>(
    MOCK_MODE ? "Mock contract text loaded." : null,
  );
  const [fileName, setFileName] = useState<string | null>(
    MOCK_MODE ? "mock-contract.pdf" : null,
  );
  const [pageCount, setPageCount] = useState<number | null>(
    MOCK_MODE ? 82 : null,
  );
  const [result, setResult] = useState<ExtractionResult | null>(
    MOCK_MODE ? MOCK_RESULT : null,
  );
  const [salientFeatures, setSalientFeatures] =
    useState<SalientFeatures | null>(
      MOCK_MODE ? (MOCK_RESULT.salientFeatures ?? null) : null,
    );
  const [contractData, setContractData] = useState<ContractData | null>(
    MOCK_MODE ? MOCK_RESULT.contract : null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    console.log(
      "[contractText] updated:",
      contractText ? `${contractText.length} chars` : "null",
    );
  }, [contractText]);

  useCopilotReadable({
    description: "Full text of the uploaded revenue contract",
    value:
      contractText ?? "No contract uploaded yet. Ask the user to upload a PDF.",
  });

  // Action 1: Salient features card
  useCopilotAction({
    name: "show_salient_features",
    description:
      "Extract and display key contract terms: payment cycles, renewal, termination, governing law",
    parameters: [
      {
        name: "features",
        type: "object",
        description: "Salient features extracted from the contract",
        required: true,
        attributes: [
          {
            name: "paymentTerms",
            type: "string",
            description: "Payment due terms, e.g. Net 30 days from invoice",
          },
          {
            name: "billingCycle",
            type: "string",
            description: "How often invoiced, e.g. Annual in advance, Monthly",
          },
          {
            name: "renewalTerms",
            type: "string",
            description: "Auto-renewal conditions and notice period",
          },
          {
            name: "terminationRights",
            type: "string",
            description: "Conditions and notice period for termination",
          },
          {
            name: "governingLaw",
            type: "string",
            description: "Jurisdiction and governing law",
          },
          {
            name: "initialTerm",
            type: "string",
            description: "Duration of the initial contract term",
          },
          {
            name: "citations",
            type: "string[]",
            description: "Section/page citations for each field",
          },
        ],
      },
    ],
    render: ({ status, args }) => {
      console.log("[render:show_salient_features] status:", status);
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Extracting key contract terms…
          </div>
        );
      }
      const parsed = SalientFeaturesSchema.safeParse(args.features);
      console.log(
        "[render:show_salient_features] schema valid:",
        parsed.success,
      );
      if (!parsed.success) {
        console.error(
          "[show_salient_features] Schema validation failed:",
          parsed.error.flatten(),
        );
        return (
          <p className="text-sm text-red-400">
            Could not parse salient features from the contract.
          </p>
        );
      }
      return <SalientFeaturesCard features={parsed.data} />;
    },
    handler: async ({ features: rawFeatures }) => {
      console.log("[handler:show_salient_features] invoked");
      const parsed = SalientFeaturesSchema.safeParse(rawFeatures);
      console.log(
        "[handler:show_salient_features] schema valid:",
        parsed.success,
      );
      if (parsed.success) {
        setSalientFeatures(parsed.data);
      } else {
        console.error(
          "[show_salient_features] Invalid data:",
          parsed.error.flatten(),
        );
      }
    },
  });

  // Action 2: Revenue recognition schedule
  useCopilotAction({
    name: "generate_revenue_schedule",
    description:
      "Generate and display a GAAP ASC 606 revenue recognition schedule. Call ONLY when the user explicitly requests the schedule.",
    parameters: [
      {
        name: "result",
        type: "object",
        description: "The full extraction result",
        required: true,
        attributes: [
          {
            name: "contract",
            type: "object",
            description: "Contract metadata extracted from the document",
            attributes: [
              {
                name: "vendor",
                type: "string",
                description: "Name of the vendor/seller",
              },
              {
                name: "customer",
                type: "string",
                description: "Name of the customer/buyer",
              },
              {
                name: "totalValue",
                type: "number",
                description:
                  "Total contract value as a number (no commas or $)",
              },
              {
                name: "currency",
                type: "string",
                description: "Currency code, e.g. USD",
              },
              {
                name: "startDate",
                type: "string",
                description: "Contract start date YYYY-MM-DD",
              },
              {
                name: "endDate",
                type: "string",
                description: "Contract end date YYYY-MM-DD",
              },
              {
                name: "executionDate",
                type: "string",
                description: "Date the contract was signed YYYY-MM-DD",
              },
              {
                name: "confidence",
                type: "number",
                description: "Overall extraction confidence 0-100",
              },
              {
                name: "obligations",
                type: "object[]",
                description: "Array of performance obligations",
                attributes: [
                  {
                    name: "name",
                    type: "string",
                    description: "Name of the performance obligation",
                  },
                  {
                    name: "type",
                    type: "string",
                    description: "over-time or point-in-time",
                  },
                  {
                    name: "totalValue",
                    type: "number",
                    description: "Allocated value as a number",
                  },
                  {
                    name: "startDate",
                    type: "string",
                    description: "Start date YYYY-MM-DD",
                  },
                  {
                    name: "endDate",
                    type: "string",
                    description: "End date YYYY-MM-DD (optional)",
                  },
                  {
                    name: "confidence",
                    type: "number",
                    description: "Confidence 0-100",
                  },
                  {
                    name: "citation",
                    type: "string",
                    description: "Section/page citation",
                  },
                ],
              },
            ],
          },
          {
            name: "schedule",
            type: "object",
            description: "Month-by-month revenue recognition schedule",
            attributes: [
              {
                name: "lineItems",
                type: "object[]",
                description: "One row per recognition event",
                attributes: [
                  {
                    name: "period",
                    type: "string",
                    description: "e.g. Nov 2015",
                  },
                  {
                    name: "amount",
                    type: "number",
                    description: "Amount recognized in this period",
                  },
                  {
                    name: "recognitionType",
                    type: "string",
                    description: "over-time or point-in-time",
                  },
                  {
                    name: "confidence",
                    type: "number",
                    description: "Confidence 0-100",
                  },
                  {
                    name: "citation",
                    type: "string",
                    description: "Section/page citation",
                  },
                  {
                    name: "description",
                    type: "string",
                    description: "Short description of what is recognized",
                  },
                ],
              },
              {
                name: "totalRecognized",
                type: "number",
                description: "Sum of all line item amounts",
              },
              {
                name: "contractValue",
                type: "number",
                description:
                  "Total contract value (must match contract.totalValue)",
              },
              {
                name: "isBalanced",
                type: "boolean",
                description:
                  "true if totalRecognized equals contractValue within $0.01",
              },
              {
                name: "discrepancy",
                type: "number",
                description:
                  "Absolute difference between totalRecognized and contractValue",
              },
              {
                name: "verificationNote",
                type: "string",
                description: "One-sentence ASC 606 verification summary",
              },
            ],
          },
          {
            name: "rawCitations",
            type: "string[]",
            description: "All cited sections/pages",
          },
          {
            name: "extractionNote",
            type: "string",
            description: "Optional extraction quality note",
          },
        ],
      },
    ],
    render: ({ status, args }) => {
      console.log(
        "[render:generate_revenue_schedule] status:",
        status,
        "| args.result keys:",
        Object.keys(args?.result ?? {}),
      );
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Generating revenue recognition schedule…
          </div>
        );
      }
      const parsed = ExtractionResultSchema.safeParse(args.result);
      console.log(
        "[render:generate_revenue_schedule] schema valid:",
        parsed.success,
        parsed.success
          ? `lineItems: ${parsed.data.schedule.lineItems.length}`
          : parsed.error.flatten(),
      );
      if (!parsed.success) {
        console.error(
          "[generate_revenue_schedule] Schema validation failed:",
          parsed.error.flatten(),
        );
        return (
          <p className="text-sm text-red-400">
            The AI returned an unexpected data format. Missing fields:{" "}
            {Object.keys(parsed.error.flatten().fieldErrors).join(", ") ||
              "unknown"}
          </p>
        );
      }
      const data = parsed.data;
      return (
        <div className="space-y-2 my-2">
          <RevenueTable schedule={data.schedule} />
          {data.extractionNote && (
            <p className="text-xs text-slate-500 italic">
              {data.extractionNote}
            </p>
          )}
        </div>
      );
    },
    handler: async ({ result: rawResult }) => {
      console.log("[handler:generate_revenue_schedule] invoked");
      const parsed = ExtractionResultSchema.safeParse(rawResult);
      console.log(
        "[handler:generate_revenue_schedule] schema valid:",
        parsed.success,
      );
      if (parsed.success) {
        setResult(parsed.data);
        setContractData(parsed.data.contract);
      } else {
        console.error(
          "[generate_revenue_schedule] Invalid result from AI:",
          parsed.error.flatten(),
        );
      }
    },
  });

  const handleParsed = (text: string, pages: number, name: string) => {
    setContractText(text);
    setPageCount(pages);
    setFileName(name);
    setResult(null);
    setContractData(null);
    setSalientFeatures(null);
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
          <h1 className="text-sm font-bold text-slate-100 tracking-tight">
            Auditore
          </h1>
          <p className="text-xs text-slate-400">ASC 606 — GAAP Compliant</p>
        </div>

        {MOCK_MODE && (
          <div className="flex items-center gap-3 ml-4">
            <span className="text-xs font-mono px-2 py-1 rounded border border-amber-700/50 bg-amber-900/30 text-amber-400">
              MOCK MODE
            </span>
            {fileName && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{fileName}</span>
                {pageCount && (
                  <span className="text-slate-500">({pageCount} pages)</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chat toggle */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          {chatOpen ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5" />
          )}
          {chatOpen ? "Close Chat" : "Open Chat"}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — 2/3 width */}
        <div className="flex-[2] overflow-y-auto min-w-0">
          <div className="p-6 space-y-6 max-w-3xl mx-auto">
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
              </div>
            )}

            {/* Results — build up as AI responds */}
            {contractData && (
              <ContractSummary
                contract={contractData}
                citations={result?.rawCitations}
              />
            )}
            {salientFeatures && (
              <SalientFeaturesCard features={salientFeatures} />
            )}
            {result?.schedule && <RevenueTable schedule={result.schedule} />}

            {/* Empty state */}
            {!contractText && !MOCK_MODE && (
              <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                <FileSearch className="w-14 h-14 mb-4 opacity-20" />
                <p className="text-base font-medium text-slate-400">
                  Upload a contract PDF to begin
                </p>
                <p className="text-sm mt-1 opacity-60">
                  Supports contracts up to 50 MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel — 1/3 width */}
        {chatOpen && (
          <div className="flex-[1] min-w-[320px] max-w-[480px] shrink-0 border-l border-slate-800 flex flex-col overflow-hidden">
            <CopilotChat
              key={contractText ? "loaded" : "idle"}
              className="flex flex-col h-full"
              labels={{
                title: "Revenue Audit Assistant",
                initial: contractText
                  ? `Contract loaded (${pageCount ?? "?"} pages). Try asking:\n• "Tell me about this contract"\n• "What are the payment terms?"\n• "What are the performance obligations?"\n• "Generate the revenue recognition schedule"`
                  : "Upload a contract PDF on the left to begin. I'll help you understand the contract terms and generate an ASC 606 revenue recognition schedule.",
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
