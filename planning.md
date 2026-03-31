# Revenue Recognition AI Agent — Sprint Plan

**Goal:** Build an AI-powered GAAP ASC 606 revenue recognition auditor in 7 hours.

---

## Phase 1 — Environment & PDF Extraction ✅
**Goal:** Infrastructure running, PDF-to-text pipeline working.

| Task | File | Status |
|---|---|---|
| Install dependencies | package.json | Done |
| Define types & Zod schemas | src/lib/types.ts | Done |
| PDF parser wrapper | src/lib/pdf-parser.ts | Done |
| ASC 606 accounting logic | src/lib/accounting-logic.ts | Done |
| PDF upload API route | src/app/api/upload/route.ts | Done |
| CopilotKit + Gemini API route | src/app/api/copilotkit/route.ts | Done |

**Verification:** `POST /api/upload` with a PDF → `{ text, pageCount, fileName }`

---

## Phase 2 — UI Shell & Mock Mode ✅
**Goal:** Full UI visible with realistic mock data — zero API credits burned.

| Task | File | Status |
|---|---|---|
| Mock contract & schedule data | src/lib/mock-data.ts | Done |
| RevenueTable component | src/components/RevenueTable.tsx | Done |
| ContractSummary component | src/components/ContractSummary.tsx | Done |
| UploadZone (drag-drop) | src/components/UploadZone.tsx | Done |
| Root layout + CopilotKit styles | src/app/layout.tsx | Done |
| Main page with chat + upload | src/app/page.tsx | Done |

**To preview mock mode:** Add `NEXT_PUBLIC_MOCK_MODE=true` to `.env.local`, then `npm run dev`.

---

## Phase 3 — AI Agent Logic 🔄
**Goal:** Real Gemini extraction with generative UI rendering in chat.

| Task | Details |
|---|---|
| Add `GEMINI_API_KEY` to `.env.local` | Required for Gemini 2.5 Flash |
| `useCopilotReadable` wires contract text | Already in page.tsx — active once PDF uploaded |
| `useCopilotAction` renders table in chat | Already in page.tsx — triggers on AI call |
| Gemini model selection | `gemini-2.5-flash-preview-04-17` in api/copilotkit/route.ts |

**To enable:** Set `GEMINI_API_KEY` in `.env.local`, set `NEXT_PUBLIC_MOCK_MODE=false`.

---

## Phase 4 — Verification & Polish
**Goal:** Production-ready verification loop and polished UX.

- [ ] Confirm `verifySchedule()` logs discrepancy in chat when sum ≠ contract value
- [ ] Add loading skeleton to RevenueTable (while AI streams)
- [ ] Error boundary around chat panel
- [ ] Run `npx tsc --noEmit` — fix any type errors
- [ ] Final review of confidence badge coloring and citation formatting

---

## Architecture: PDF Context Persistence

```
User uploads PDF
    → POST /api/upload → { text, pageCount }
    → text stored in React useState (client)
    → useCopilotReadable("contract_text", text)
    → Every CopilotKit message includes full contract as context
    → Gemini 2.5 Flash (1M ctx window) answers follow-up questions
    → No re-parsing, no session storage, no server cache needed
```

---

## Quick Start

```bash
# 1. Copy env template
cp .env.local.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 2. Start in mock mode (no API key needed)
NEXT_PUBLIC_MOCK_MODE=true npm run dev

# 3. Start with real AI
npm run dev
# Upload a contract PDF → ask "analyze this contract"
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/lib/types.ts` | Zod schemas: RevenueLineItem, ContractData, RecognitionSchedule |
| `src/lib/accounting-logic.ts` | calcStraightLine, calcPointInTime, verifySchedule |
| `src/lib/mock-data.ts` | MOCK_RESULT — realistic 2-year SaaS contract |
| `src/app/api/copilotkit/route.ts` | Gemini 2.5 Flash via CopilotKit runtime |
| `src/app/api/upload/route.ts` | Multipart PDF → parsed text |
| `src/components/RevenueTable.tsx` | ASC 606 table with confidence badges + citations |
| `src/components/ContractSummary.tsx` | Contract overview card with obligation breakdown |
| `src/components/UploadZone.tsx` | Drag-drop PDF upload with progress state |
| `src/app/page.tsx` | Main UI: CopilotKit + useCopilotAction generative rendering |
