"use client";

import React, { useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TestCase {
  id: string;
  name: string;
  category: string;
  orderNumber: string;
  dispatch: {
    timestamp: string;
    hash: string;
    sealStatus: string;
    accessoriesCount: number;
    accessoriesTotal: number;
    serial: string;
  };
  returnIntake: {
    timestamp: string;
    hash: string;
    sealStatus: string;
    accessoriesCount: number;
    accessoriesTotal: number;
    serial: string;
    conditionScore: number;
    findings: string[];
    decision: string;
    decisionType: "partial" | "rejected" | "approved";
  };
}

export function VerificationEngine() {
  const testCases: TestCase[] = [
    {
      id: "case-1",
      name: "Sony WH-1000XM5 Headphones",
      category: "Consumer Electronics",
      orderNumber: "RP-8821-X9",
      dispatch: {
        timestamp: "Dec 12, 2026 • 09:14 UTC",
        hash: "7f83b165...bc6841e6",
        sealStatus: "INTACT_FACTORY_SEAL",
        accessoriesCount: 4,
        accessoriesTotal: 4,
        serial: "SN: 7492-X902-WH5",
      },
      returnIntake: {
        timestamp: "Dec 20, 2026 • 15:42 UTC",
        hash: "e4129a08...f1027b99",
        sealStatus: "BROKEN_BY_CUSTOMER",
        accessoriesCount: 3,
        accessoriesTotal: 4,
        serial: "SN: 7492-X902-WH5",
        conditionScore: 92.4,
        findings: [
          "Item Serial Confirmed: Exact match with dispatch record",
          "Missing Accessory: USB-C braided charging cable absent",
          "Cosmetic Finding: Superficial 3mm scratch on left gimbal",
          "Functionality: Drivers and Active Noise Cancelling operational",
        ],
        decision: "Partial Refund Approved — Deduct Cable ($15.00)",
        decisionType: "partial",
      },
    },
    {
      id: "case-2",
      name: "Apple iPhone 16 Pro Max 256GB",
      category: "Smartphones",
      orderNumber: "RP-9402-A1",
      dispatch: {
        timestamp: "Dec 15, 2026 • 11:30 UTC",
        hash: "9912bc0a...5541ea22",
        sealStatus: "ORIGINAL_PULL_TAB",
        accessoriesCount: 2,
        accessoriesTotal: 2,
        serial: "IMEI: 354829104928172",
      },
      returnIntake: {
        timestamp: "Dec 23, 2026 • 13:10 UTC",
        hash: "4a88019b...cc871400",
        sealStatus: "RE-GLUED_NON_OEM",
        accessoriesCount: 1,
        accessoriesTotal: 2,
        serial: "IMEI: 354899990182741 (MISMATCH)",
        conditionScore: 12.0,
        findings: [
          "CRITICAL FRAUD ALERT: Return IMEI does not match dispatch unit",
          "Device Swap: Returned unit is blacklisted iPhone 14 Pro chassis",
          "Tamper Alert: Third-party counterfeit adhesive detected",
          "Carrier Alert: Handset IMEI flagged on national blacklist database",
        ],
        decision: "Return Fraud Rejected — Dispute Report Generated",
        decisionType: "rejected",
      },
    },
    {
      id: "case-3",
      name: "Bottega Veneta Leather Tote",
      category: "Luxury Fashion",
      orderNumber: "RP-7719-L3",
      dispatch: {
        timestamp: "Dec 18, 2026 • 16:05 UTC",
        hash: "3381ea5b...10948c21",
        sealStatus: "SECURITY_TAG_#BV-491",
        accessoriesCount: 3,
        accessoriesTotal: 3,
        serial: "RFID TAG: 0x48A901",
      },
      returnIntake: {
        timestamp: "Dec 24, 2026 • 11:18 UTC",
        hash: "6612df99...871b002c",
        sealStatus: "TAG_INTACT_AUTHENTIC",
        accessoriesCount: 3,
        accessoriesTotal: 3,
        serial: "RFID TAG: 0x48A901",
        conditionScore: 99.8,
        findings: [
          "Tamper Seal #BV-491: 100% Intact and verified authentic",
          "RFID Serial: Matches merchant dispatch cryptography",
          "Leather Condition: Zero creasing, zero corner wear (Grade A+)",
          "All Original Accessories: Dust bag and care cards included",
        ],
        decision: "100% Authorized — Instant Refund Dispatched",
        decisionType: "approved",
      },
    },
  ];

  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const current = testCases[activeCaseIndex];

  return (
    <section id="verification-engine" className="w-full py-24 sm:py-32 relative bg-[#09090c] border-y border-white/[0.06]">
      <div className="site-container">
        <SectionHeading
          badge="Live Interactive Engine"
          badgeVariant="success"
          title="Compare. Verify. Understand."
          serifHighlight="Verify. Understand."
          subtitle="Explore live side-by-side condition matching. ReturnProof cross-references dispatch baselines against return evidence in milliseconds."
          align="center"
        />

        {/* Case Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {testCases.map((c, index) => (
            <button
              key={c.id}
              onClick={() => setActiveCaseIndex(index)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeCaseIndex === index
                  ? "bg-[#3867FF] text-white shadow-[0_0_20px_rgba(56,103,255,0.4)] border border-[#3867FF]"
                  : "bg-[#141417] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              <span>{c.name}</span>
              <span className="ml-2 font-mono text-[11px] opacity-75">
                ({c.orderNumber})
              </span>
            </button>
          ))}
        </div>

        {/* Comparison Console Card */}
        <div className="rounded-3xl bg-[#121215] border border-white/[0.1] shadow-2xl shadow-black overflow-hidden">
          {/* Header Bar */}
          <div className="p-6 bg-[#17171c] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#7fa3ff] bg-[#3867FF]/15 px-2 py-0.5 rounded border border-[#3867FF]/30">
                  {current.orderNumber}
                </span>
                <span className="text-xs text-zinc-400">• {current.category}</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {current.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">Match Confidence:</span>
              <span
                className={`text-2xl font-bold font-mono ${
                  current.returnIntake.conditionScore > 90
                    ? "text-[#20C997]"
                    : current.returnIntake.conditionScore > 50
                    ? "text-amber-400"
                    : "text-rose-500"
                }`}
              >
                {current.returnIntake.conditionScore}%
              </span>
            </div>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel: Dispatch Baseline */}
            <div className="flex flex-col space-y-4 p-5 rounded-2xl bg-[#0d0d10] border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3867FF]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-zinc-300">
                    Dispatch Baseline Evidence
                  </span>
                </div>
                <Badge variant="outline" size="sm" className="text-zinc-400 font-mono">
                  Origin Reference
                </Badge>
              </div>

              {/* Viewport Illustration */}
              <div className="relative w-full h-48 rounded-xl bg-[#060608] border border-white/10 p-4 flex flex-col justify-between overflow-hidden bg-dark-grid">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>DISPATCH_SCAN_01</span>
                  <span className="text-emerald-400">100% UNTOUCHED</span>
                </div>

                <div className="text-center my-auto">
                  <div className="inline-block p-3 rounded-lg border border-dashed border-[#3867FF]/40 bg-[#3867FF]/5">
                    <p className="font-mono text-xs font-semibold text-white">
                      {current.dispatch.serial}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Factory Sealed • Full Package
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500">
                  <span>Logged: {current.dispatch.timestamp}</span>
                  <span className="text-[#85a8ff]">NOTARIZED</span>
                </div>
              </div>

              {/* Baseline Metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Security Seal:</span>
                  <span className="text-emerald-400">{current.dispatch.sealStatus}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Accessories Present:</span>
                  <span className="text-zinc-200">
                    {current.dispatch.accessoriesCount} of {current.dispatch.accessoriesTotal} items
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Baseline SHA-256:</span>
                  <span className="text-[#85a8ff]">{current.dispatch.hash}</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Return Intake Evidence */}
            <div className="flex flex-col space-y-4 p-5 rounded-2xl bg-[#0d0d10] border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      current.returnIntake.decisionType === "approved"
                        ? "bg-[#20C997]"
                        : current.returnIntake.decisionType === "partial"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="text-xs uppercase tracking-wider font-bold text-zinc-300">
                    Return Intake Evidence
                  </span>
                </div>
                <Badge
                  variant={
                    current.returnIntake.decisionType === "approved"
                      ? "success"
                      : current.returnIntake.decisionType === "partial"
                      ? "warning"
                      : "danger"
                  }
                  size="sm"
                  className="font-mono"
                >
                  {current.returnIntake.decisionType.toUpperCase()}
                </Badge>
              </div>

              {/* Viewport Illustration */}
              <div className="relative w-full h-48 rounded-xl bg-[#060608] border border-white/10 p-4 flex flex-col justify-between overflow-hidden bg-dark-grid">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>RETURN_SCAN_DIFF</span>
                  <span
                    className={
                      current.returnIntake.decisionType === "approved"
                        ? "text-emerald-400"
                        : current.returnIntake.decisionType === "partial"
                        ? "text-amber-400"
                        : "text-rose-400 font-bold"
                    }
                  >
                    AI DELTA DETECTED
                  </span>
                </div>

                <div className="text-center my-auto">
                  <div
                    className={`inline-block p-3 rounded-lg border border-dashed ${
                      current.returnIntake.decisionType === "approved"
                        ? "border-[#20C997]/40 bg-[#20C997]/5"
                        : current.returnIntake.decisionType === "partial"
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-rose-500/40 bg-rose-500/5"
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold text-white">
                      {current.returnIntake.serial}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        current.returnIntake.decisionType === "rejected"
                          ? "text-rose-400 font-bold"
                          : "text-zinc-400"
                      }`}
                    >
                      {current.returnIntake.decisionType === "rejected"
                        ? "FRAUDULENT SWAP DETECTED"
                        : "Inspection Completed"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500">
                  <span>Intake: {current.returnIntake.timestamp}</span>
                  <span className="text-[#85a8ff]">NOTARIZED</span>
                </div>
              </div>

              {/* Return Metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Return Seal:</span>
                  <span
                    className={
                      current.returnIntake.sealStatus.includes("INTACT")
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }
                  >
                    {current.returnIntake.sealStatus}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Accessories Present:</span>
                  <span
                    className={
                      current.returnIntake.accessoriesCount === current.returnIntake.accessoriesTotal
                        ? "text-zinc-200"
                        : "text-amber-400 font-bold"
                    }
                  >
                    {current.returnIntake.accessoriesCount} of {current.returnIntake.accessoriesTotal} items
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-zinc-400">Intake SHA-256:</span>
                  <span className="text-[#85a8ff]">{current.returnIntake.hash}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Analysis Findings & Automated Decision */}
          <div className="p-6 lg:p-8 bg-[#101014] border-t border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Automated Verification Findings:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-300">
                {current.returnIntake.findings.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#3867FF] text-xs">▸</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full lg:w-auto p-4 rounded-xl bg-[#16161b] border border-white/10 flex flex-col space-y-3 min-w-[320px]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 block">
                  Recommended Action:
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${
                    current.returnIntake.decisionType === "approved"
                      ? "text-[#20C997]"
                      : current.returnIntake.decisionType === "partial"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {current.returnIntake.decision}
                </span>
              </div>

              <Button
                variant={current.returnIntake.decisionType === "rejected" ? "secondary" : "primary"}
                size="sm"
                className="w-full"
              >
                Export Dispute Evidence PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
