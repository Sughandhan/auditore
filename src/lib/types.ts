import { z } from "zod";

export const RecognitionTypeSchema = z.enum(["over-time", "point-in-time"]);
export type RecognitionType = z.infer<typeof RecognitionTypeSchema>;

export const RevenueLineItemSchema = z.object({
  period: z.string(),
  amount: z.coerce.number(),
  recognitionType: RecognitionTypeSchema,
  confidence: z.coerce.number().min(0).max(100),
  citation: z.string(),
  description: z.string(),
});
export type RevenueLineItem = z.infer<typeof RevenueLineItemSchema>;

export const PerformanceObligationSchema = z.object({
  name: z.string(),
  type: RecognitionTypeSchema,
  totalValue: z.coerce.number(),
  startDate: z.string(),
  endDate: z.string().optional(),
  confidence: z.coerce.number().min(0).max(100),
  citation: z.string(),
});
export type PerformanceObligation = z.infer<typeof PerformanceObligationSchema>;

export const ContractDataSchema = z.object({
  vendor: z.string(),
  customer: z.string(),
  totalValue: z.coerce.number(),
  currency: z.string().default("USD"),
  startDate: z.string(),
  endDate: z.string(),
  executionDate: z.string(),
  obligations: z.array(PerformanceObligationSchema),
  confidence: z.coerce.number().min(0).max(100),
});
export type ContractData = z.infer<typeof ContractDataSchema>;

export const RecognitionScheduleSchema = z.object({
  lineItems: z.array(RevenueLineItemSchema),
  totalRecognized: z.coerce.number(),
  contractValue: z.coerce.number(),
  isBalanced: z.boolean(),
  discrepancy: z.coerce.number(),
  verificationNote: z.string(),
});
export type RecognitionSchedule = z.infer<typeof RecognitionScheduleSchema>;

export const SalientFeaturesSchema = z.object({
  paymentTerms: z.string(),
  billingCycle: z.string(),
  renewalTerms: z.string(),
  terminationRights: z.string(),
  governingLaw: z.string(),
  initialTerm: z.string(),
  citations: z.array(z.string()).default([]),
});
export type SalientFeatures = z.infer<typeof SalientFeaturesSchema>;

export const ExtractionResultSchema = z.object({
  contract: ContractDataSchema,
  schedule: RecognitionScheduleSchema,
  rawCitations: z.array(z.string()).default([]),
  extractionNote: z.string().optional(),
  salientFeatures: SalientFeaturesSchema.optional(),
});
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
