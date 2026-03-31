"use client";

import { ContractData } from "@/lib/types";
import { Building2, Calendar, DollarSign, FileText, ShieldCheck } from "lucide-react";

interface ContractSummaryProps {
  contract: ContractData | undefined;
  citations?: string[];
}

function InfoRow({ icon: Icon, label, value, mono = false }: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className={`text-sm text-slate-200 truncate ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function ContractSummary({ contract, citations = [] }: ContractSummaryProps) {
  if (!contract) {
    return (
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-6 text-sm text-slate-500">
        No contract data available.
      </div>
    );
  }

  const obligations = contract.obligations ?? [];
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: contract.currency ?? "USD" }).format(
      Number.isFinite(n) ? n : 0
    );

  const totalObligation = obligations.reduce((s, o) => s + o.totalValue, 0);
  const isAllocated = Math.abs(totalObligation - contract.totalValue) <= 0.01;

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Contract Summary</span>
        </div>
        <h3 className="text-base font-semibold text-slate-100 leading-tight">
          {contract.vendor} — {contract.customer}
        </h3>
      </div>

      {/* Details */}
      <div className="px-5 py-2">
        <InfoRow icon={Building2} label="Vendor" value={contract.vendor} />
        <InfoRow icon={Building2} label="Customer" value={contract.customer} />
        <InfoRow
          icon={DollarSign}
          label="Total Contract Value"
          value={`${fmt(contract.totalValue)} ${contract.currency}`}
          mono
        />
        <InfoRow icon={Calendar} label="Contract Start" value={contract.startDate} mono />
        <InfoRow icon={Calendar} label="Contract End" value={contract.endDate} mono />
        <InfoRow icon={Calendar} label="Execution Date" value={contract.executionDate} mono />
      </div>

      {/* Performance Obligations */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-2 mt-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Performance Obligations</p>
          {isAllocated ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Fully Allocated
            </span>
          ) : (
            <span className="text-xs text-amber-400">Allocation mismatch</span>
          )}
        </div>
        <div className="space-y-2">
          {obligations.map((ob, i) => (
            <div key={i} className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{ob.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ob.citation}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono font-semibold text-slate-100">{fmt(ob.totalValue)}</p>
                  <span className={`text-xs ${ob.type === "over-time" ? "text-sky-400" : "text-violet-400"}`}>
                    {ob.type === "over-time" ? "Over-time" : "Point-in-time"}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-700">
                  <div
                    className={`h-1.5 rounded-full ${ob.type === "over-time" ? "bg-sky-500" : "bg-violet-500"}`}
                    style={{ width: `${(ob.totalValue / (contract.totalValue || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {((ob.totalValue / (contract.totalValue || 1)) * 100).toFixed(1)}%
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border font-mono ${
                  ob.confidence >= 80
                    ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
                    : "text-amber-400 border-amber-400/20 bg-amber-400/10"
                }`}>
                  {ob.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citations */}
      {citations.length > 0 && (
        <div className="px-5 pb-4 pt-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Audit Citations</p>
          <div className="space-y-1.5">
            {citations.map((c, i) => (
              <p key={i} className="text-xs text-slate-400 font-mono bg-slate-800 rounded px-3 py-1.5 border border-slate-700">
                {c}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Confidence footer */}
      <div className="px-5 py-3 border-t border-slate-700 bg-slate-800/40 flex items-center justify-between">
        <span className="text-xs text-slate-400">Overall extraction confidence</span>
        <span className={`text-sm font-mono font-bold ${
          contract.confidence >= 80 ? "text-emerald-400" : contract.confidence >= 60 ? "text-amber-400" : "text-red-400"
        }`}>
          {contract.confidence}%
        </span>
      </div>
    </div>
  );
}
