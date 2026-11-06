"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TamperEvidentSeal } from "@/components/ui/badge";

interface Scenario {
  id: string;
  name: string;
  product: string;
  verdict: "APPROVED" | "REJECTED" | "FLAGGED";
  identityMatch: number;
  damageScore: number;
  accessoriesPresent: boolean;
  tamperDetected: boolean;
  hash: string;
  notes: string;
}

const scenarios: Scenario[] = [
  {
    id: "legit",
    name: "Scenario A: Genuine Return (Pass)",
    product: "Apple MacBook Pro M3 (Space Black)",
    verdict: "APPROVED",
    identityMatch: 99.8,
    damageScore: 0.2,
    accessoriesPresent: true,
    tamperDetected: false,
    hash: "9b4f2c018a3d76e499f018e47209bc1e",
    notes: "Serial number matches dispatch record. Seal opened during buyer inspection, 0 exterior scratches.",
  },
  {
    id: "swap",
    name: "Scenario B: Serial Swap Fraud (Reject)",
    product: "NVIDIA GeForce RTX 4090 GPU",
    verdict: "REJECTED",
    identityMatch: 12.4,
    damageScore: 4.8,
    accessoriesPresent: false,
    tamperDetected: true,
    hash: "3a88c7f12e094ba176b9042e8812cfa5",
    notes: "CRITICAL: Return box contained older GTX 1070 with altered barcode sticker. Flagged for fraud review.",
  },
  {
    id: "damaged",
    name: "Scenario C: Courier Transit Damage (Claim)",
    product: "Bowers & Wilkins Zeppelin Speaker",
    verdict: "FLAGGED",
    identityMatch: 100.0,
    damageScore: 84.6,
    accessoriesPresent: true,
    tamperDetected: false,
    hash: "e519082bcfa749001882d41b67f4019a",
    notes: "Authentic item returned, but rear housing cracked during transit. Automated carrier insurance claim initiated.",
  },
];

export function CustodySimulator() {
  const [selectedId, setSelectedId] = useState<string>("legit");
  const active = scenarios.find((s) => s.id === selectedId) || scenarios[0];

  return (
    <section id="verification" className="w-full py-20 lg:py-28 bg-white border-t border-slate-200/80">
      <div className="site-container space-y-16 lg:space-y-20">
        <SectionHeading
          badge="Interactive Verification Engine"
          badgeVariant="success"
          title="Simulate Real-Time Return Audits"
          description="Test ReturnProof's dual-frame computer vision and cryptographic hash checking against common return fraud patterns."
        />

        <div className="w-full space-y-6">
          {/* Scenario Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 max-w-2xl mx-auto">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  selectedId === s.id
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Interactive Inspection Workspace Card */}
          <Card variant="light-gray" className="border-slate-200 overflow-hidden shadow-xl w-full">
            <div className="border-b border-slate-200 bg-slate-100/70 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {active.product}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Session Audit Hash: {active.hash}
                  </p>
                </div>
              </div>

              <div>
                {active.verdict === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    VERIFICATION APPROVED
                  </span>
                )}
                {active.verdict === "REJECTED" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    FRAUD DETECTED (REJECTED)
                  </span>
                )}
                {active.verdict === "FLAGGED" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    TRANSIT DAMAGE FLAGGED
                  </span>
                )}
              </div>
            </div>

            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6">
                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Identity Match
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {active.identityMatch}%
                  </div>
                  <div className="text-xs">
                    {active.identityMatch > 95 ? (
                      <span className="text-emerald-600 font-semibold">✓ Serial Confirmed</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">✗ Counterfeit Mismatch</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Damage Deviation
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {active.damageScore}%
                  </div>
                  <div className="text-xs">
                    {active.damageScore < 5 ? (
                      <span className="text-emerald-600 font-semibold">✓ Pristine State</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">⚠ Structural Damage</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Accessories
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {active.accessoriesPresent ? "Complete" : "Missing"}
                  </div>
                  <div className="text-xs">
                    {active.accessoriesPresent ? (
                      <span className="text-emerald-600 font-semibold">✓ Cables & Manuals</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">✗ 3 Items Missing</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-2 shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tamper Evident Seal
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {active.tamperDetected ? "Broken" : "Valid"}
                  </div>
                  <div className="text-xs">
                    {active.tamperDetected ? (
                      <span className="text-rose-600 font-semibold">✗ Seal Forgery</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">✓ SHA-256 Intact</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Findings Box */}
              <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Automated Chain-of-Custody Findings:
                  </span>
                  <TamperEvidentSeal hash={active.hash} />
                </div>
                <p className="text-sm sm:text-base text-slate-800 font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
                  {active.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
