"use client";

import type { SalientFeatures as SalientFeaturesData } from "@/lib/types";
import { CreditCard, RefreshCw, XCircle, Scale, Clock, Calendar, FileText } from "lucide-react";

interface SalientFeaturesProps {
  features: SalientFeaturesData | undefined;
}

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800 last:border-0">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-200 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function SalientFeatures({ features }: SalientFeaturesProps) {
  if (!features) {
    return (
      <div className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-6 text-sm text-slate-500">
        No salient features available.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Key Contract Terms</span>
        </div>
        <p className="text-xs text-slate-400">Salient features extracted from the contract</p>
      </div>

      {/* Rows */}
      <div className="px-5 py-2">
        <InfoRow icon={CreditCard} label="Payment Terms" value={features.paymentTerms} />
        <InfoRow icon={Calendar} label="Billing Cycle" value={features.billingCycle} />
        <InfoRow icon={Clock} label="Initial Term" value={features.initialTerm} />
        <InfoRow icon={RefreshCw} label="Renewal Terms" value={features.renewalTerms} />
        <InfoRow icon={XCircle} label="Termination Rights" value={features.terminationRights} />
        <InfoRow icon={Scale} label="Governing Law" value={features.governingLaw} />
      </div>

      {/* Citations */}
      {features.citations.length > 0 && (
        <div className="px-5 pb-4 pt-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sources</p>
          <div className="space-y-1.5">
            {features.citations.map((c, i) => (
              <p key={i} className="text-xs text-slate-400 font-mono bg-slate-800 rounded px-3 py-1.5 border border-slate-700">
                {c}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
