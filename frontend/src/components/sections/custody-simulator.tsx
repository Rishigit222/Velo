"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Hash,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, VerificationIndicator, TamperEvidentSeal } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <section id="verification" className="py-24 bg-white border-t border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <SectionHeading
          badge="Interactive Verification Engine"
          badgeVariant="success"
          title="Simulate Real-Time Return Audits"
          description="Test ReturnProof's dual-frame computer vision and cryptographic hash checking against common return fraud patterns."
        />

        <div className="mx-auto max-w-5xl space-y-6">
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
          <Card variant="light-gray" className="border-slate-200 overflow-hidden shadow-md">
            <div className="border-b border-slate-200 bg-slate-100/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {active.product}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    Session Audit Hash: {active.hash}
                  </p>
                </div>
              </div>

              <div>
                {active.verdict === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    VERIFICATION APPROVED
                  </span>
                )}
                {active.verdict === "REJECTED" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    FRAUD DETECTED (REJECTED)
                  </span>
                )}
                {active.verdict === "FLAGGED" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    TRANSIT DAMAGE FLAGGED
                  </span>
                )}
              </div>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Identity Match
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {active.identityMatch}%
                  </div>
                  <div className="text-xs">
                    {active.identityMatch > 95 ? (
                      <span className="text-emerald-600 font-medium">✓ Serial Confirmed</span>
                    ) : (
                      <span className="text-rose-600 font-medium">✗ Counterfeit Mismatch</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Damage Deviation
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {active.damageScore}%
                  </div>
                  <div className="text-xs">
                    {active.damageScore < 5 ? (
                      <span className="text-emerald-600 font-medium">✓ Pristine State</span>
                    ) : (
                      <span className="text-amber-600 font-medium">⚠ Structural Damage</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Accessories
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {active.accessoriesPresent ? "Complete" : "Missing"}
                  </div>
                  <div className="text-xs">
                    {active.accessoriesPresent ? (
                      <span className="text-emerald-600 font-medium">✓ Cables & Manuals</span>
                    ) : (
                      <span className="text-rose-600 font-medium">✗ 3 Items Missing</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Tamper Evident Seal
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {active.tamperDetected ? "Broken" : "Valid"}
                  </div>
                  <div className="text-xs">
                    {active.tamperDetected ? (
                      <span className="text-rose-600 font-medium">✗ Seal Forgery</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">✓ SHA-256 Intact</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Findings Box */}
              <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    Automated Chain-of-Custody Findings:
                  </span>
                  <TamperEvidentSeal hash={active.hash} />
                </div>
                <p className="text-sm text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
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
