# Auditore — AI Revenue Recognition Auditor

Upload a revenue contract PDF, ask questions in plain English, and get GAAP-compliant ASC 606 analysis rendered as interactive cards directly in the chat. Powered by Gemini 2.5 Flash — the entire contract loads into a 1M token context window at once, so every follow-up question stays in context without re-uploading.

---

## How it works

1. **Upload a PDF** — drag and drop or click the upload zone (up to 50 MB)
2. **Gemini reads the full contract** — no chunking, no retrieval pipeline; the whole document is in context
3. **Ask anything in the chat** — the AI picks the right response type based on your question
4. **Get a structured response** — one of three response types depending on what you asked (see below)

---

## What you can ask

Auditore has three response modes. You do not need to use specific commands — just ask naturally.

| What you ask | What you get |
|---|---|
| "What are the key terms?" / "Summarize this contract" / "Tell me about the payment terms" | **Salient Features Card** — payment terms, billing cycle, initial term, renewal conditions, termination rights, and governing law, each sourced from the contract |
| "Generate the revenue recognition schedule" / "Show me the ASC 606 table" | **Revenue Recognition Table** — month-by-month schedule, recognition type (over-time or point-in-time), per-line confidence scores, and a balance verification check |
| Anything else — "Can the customer terminate early?", "What does Section 6.3 say?", "Is there an auto-renewal clause?" | **Plain-text answer** with inline citations like `[Section 12.3, Page 18]` for every factual claim |

---

## Test data

The `test_data/` folder has sample contracts to get started immediately:

- **`contract_1.pdf`** — a large multi-party enterprise software agreement (~82 pages, SEC filing style). Good for testing the revenue schedule on a realistic contract.
- **`contract_2.pdf`** — a shorter contract for quicker iteration.
- **`contract_2_prompting guidelines.pdf`** — suggested questions and expected outputs specifically for `contract_2.pdf`. Read this if you want to know what to ask.

---

## Getting started

**Prerequisites:** Node.js 18+, a Gemini API key (free tier at [Google AI Studio](https://aistudio.google.com))

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local in the project root
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
NEXT_PUBLIC_MOCK_MODE=false

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), upload a PDF from `test_data/`, and start asking.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key from Google AI Studio |
| `NEXT_PUBLIC_MOCK_MODE` | Set to `"true"` to run with built-in sample data and skip the API entirely — useful for UI development |

---

## Tech stack

- **Next.js 16** (App Router)
- **CopilotKit** — agentic chat UI and generative UI actions (renders cards inline in the chat stream)
- **Gemini 2.5 Flash** — 1M token context window handles full SEC filings without chunking
- **pdf-parse** — server-side PDF text extraction
- **Tailwind CSS** + Lucide Icons
