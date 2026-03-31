"use client";

import { RecognitionSchedule } from "@/lib/types";
import { CheckCircle, AlertTriangle, TrendingUp, Clock } from "lucide-react";

interface RevenueTableProps {
  schedule: RecognitionSchedule | undefined;
  title?: string;
}

function ConfidenceBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : score >= 60
      ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-mono ${color}`}>
      {score}%
    </span>
  );
}

export default function RevenueTable({ schedule, title = "Revenue Recognition Schedule" }: RevenueTableProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      Number.isFinite(n) ? n : 0
    );

  if (!schedule) {
    return (
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-6 text-sm text-slate-500">
        No schedule data available.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">ASC 606 — GAAP Compliant</p>
        </div>
        <div className="flex items-center gap-2">
          {schedule.isBalanced ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Discrepancy {fmt(schedule.discrepancy)}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60">
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Period</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Confidence</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Citation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {schedule.lineItems.map((item, i) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 text-slate-200 font-mono text-xs whitespace-nowrap">{item.period}</td>
                <td className="px-4 py-3 text-slate-300 text-xs max-w-[180px] truncate" title={item.description}>
                  {item.description}
                </td>
                <td className="px-4 py-3">
                  {item.recognitionType === "over-time" ? (
                    <span className="flex items-center gap-1.5 text-xs text-sky-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Over-time
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-violet-400">
                      <Clock className="w-3.5 h-3.5" />
                      Point-in-time
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-100 text-xs whitespace-nowrap">
                  {fmt(item.amount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <ConfidenceBadge score={item.confidence} />
                </td>
                <td className="px-5 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">{item.citation}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-600 bg-slate-800/60">
              <td colSpan={3} className="px-5 py-3 text-xs font-semibold text-slate-300">Total Recognized</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-slate-100 text-sm">
                {fmt(schedule.totalRecognized)}
              </td>
              <td colSpan={2} className="px-5 py-3 text-xs text-slate-400">
                Contract value: {fmt(schedule.contractValue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Verification note */}
      <div className={`px-5 py-3 border-t text-xs ${
        schedule.isBalanced
          ? "border-emerald-900/40 bg-emerald-950/30 text-emerald-300"
          : "border-amber-900/40 bg-amber-950/30 text-amber-300"
      }`}>
        {schedule.verificationNote}
      </div>
    </div>
  );
}
