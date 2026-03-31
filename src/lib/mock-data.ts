import { ContractData, ExtractionResult, RecognitionSchedule } from "./types";
import { calcStraightLine, calcPointInTime, verifySchedule } from "./accounting-logic";

export const MOCK_CONTRACT: ContractData = {
  vendor: "Acme SaaS Corp.",
  customer: "GlobalTech Enterprises, Inc.",
  totalValue: 240000,
  currency: "USD",
  startDate: "2024-01-01",
  endDate: "2025-12-31",
  executionDate: "2023-12-15",
  confidence: 92,
  obligations: [
    {
      name: "SaaS Platform Subscription",
      type: "over-time",
      totalValue: 216000,
      startDate: "2024-01-01",
      endDate: "2025-12-31",
      confidence: 95,
      citation: "[Section 3.1, Page 12]",
    },
    {
      name: "Implementation & Onboarding Services",
      type: "point-in-time",
      totalValue: 24000,
      startDate: "2024-01-01",
      endDate: "2024-02-29",
      confidence: 88,
      citation: "[Section 4.2, Page 18]",
    },
  ],
};

function buildMockSchedule(): RecognitionSchedule {
  const subscription = MOCK_CONTRACT.obligations[0];
  const services = MOCK_CONTRACT.obligations[1];

  const subscriptionItems = calcStraightLine({
    totalValue: subscription.totalValue,
    startDate: subscription.startDate,
    endDate: subscription.endDate!,
    description: subscription.name,
    confidence: subscription.confidence,
    citation: subscription.citation,
  });

  const serviceItem = calcPointInTime({
    totalValue: services.totalValue,
    completionDate: "2024-02-29",
    description: services.name,
    confidence: services.confidence,
    citation: services.citation,
  });

  const allItems = [...subscriptionItems, serviceItem];
  return verifySchedule(allItems, MOCK_CONTRACT.totalValue);
}

export const MOCK_SCHEDULE: RecognitionSchedule = buildMockSchedule();

export const MOCK_RESULT: ExtractionResult = {
  contract: MOCK_CONTRACT,
  schedule: MOCK_SCHEDULE,
  rawCitations: [
    "[Section 1.1, Page 2] — Parties: Acme SaaS Corp. and GlobalTech Enterprises, Inc.",
    "[Section 2.3, Page 8] — Total Contract Value: $240,000 USD",
    "[Section 3.1, Page 12] — SaaS subscription term: January 1, 2024 – December 31, 2025",
    "[Section 4.2, Page 18] — Professional services deliverable upon completion of onboarding",
    "[Section 5.0, Page 22] — Payment schedule: annual in advance",
  ],
  extractionNote: "Mock data — upload a real contract to begin analysis.",
};
