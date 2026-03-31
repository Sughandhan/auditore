import { RevenueLineItem, RecognitionSchedule } from "./types";

/**
 * ASC 606 straight-line recognition for over-time obligations (e.g. subscriptions).
 * Generates one line item per month between startDate and endDate.
 */
export function calcStraightLine(params: {
  totalValue: number;
  startDate: string;
  endDate: string;
  description: string;
  confidence: number;
  citation: string;
}): RevenueLineItem[] {
  const { totalValue, startDate, endDate, description, confidence, citation } = params;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Build list of month-start dates
  const months: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (months.length === 0) return [];

  const perMonth = Math.round((totalValue / months.length) * 100) / 100;
  // Handle rounding remainder on last period
  const distributed = months.map((_, i) => (i < months.length - 1 ? perMonth : 0));
  const lastAmount = Math.round((totalValue - perMonth * (months.length - 1)) * 100) / 100;

  return months.map((date, i) => ({
    period: formatPeriod(date),
    amount: i < months.length - 1 ? distributed[i] : lastAmount,
    recognitionType: "over-time" as const,
    confidence,
    citation,
    description,
  }));
}

/**
 * ASC 606 point-in-time recognition (e.g. setup fees, professional services).
 * Recognizes full amount on the completion/delivery date.
 */
export function calcPointInTime(params: {
  totalValue: number;
  completionDate: string;
  description: string;
  confidence: number;
  citation: string;
}): RevenueLineItem {
  const { totalValue, completionDate, description, confidence, citation } = params;
  return {
    period: completionDate,
    amount: Math.round(totalValue * 100) / 100,
    recognitionType: "point-in-time" as const,
    confidence,
    citation,
    description,
  };
}

/**
 * Verification loop: confirms Σ line items == total contract value.
 * If discrepancy > $0.01, returns correction note.
 */
export function verifySchedule(
  lineItems: RevenueLineItem[],
  contractValue: number
): RecognitionSchedule {
  const totalRecognized = Math.round(
    lineItems.reduce((sum, item) => sum + item.amount, 0) * 100
  ) / 100;

  const discrepancy = Math.round(Math.abs(totalRecognized - contractValue) * 100) / 100;
  const isBalanced = discrepancy <= 0.01;

  const verificationNote = isBalanced
    ? `VERIFIED: Recognized $${totalRecognized.toLocaleString()} matches contract value $${contractValue.toLocaleString()}.`
    : `WARNING: Recognized $${totalRecognized.toLocaleString()} differs from contract value $${contractValue.toLocaleString()} by $${discrepancy.toLocaleString()}. Review line items.`;

  return {
    lineItems,
    totalRecognized,
    contractValue,
    isBalanced,
    discrepancy,
    verificationNote,
  };
}

function formatPeriod(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
