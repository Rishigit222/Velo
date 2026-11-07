"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const cases = [
  {
    id: "c1",
    label: "Sony WH-1000XM5",
    order: "RP-8821-X9",
    decisionType: "partial" as const,
    score: 92.4,
    dispatch: {
      timestamp: "Dec 12, 2026 · 09:14 UTC",
      hash: "7f83b165...bc6841e6",
      seal: "INTACT_FACTORY_SEAL",
      sealColor: "text-[#20C997]",
      accessories: "4 of 4",
      serial: "SN: 7492-X902-WH5",
    },
    returnData: {
      timestamp: "Dec 20, 2026 · 15:42 UTC",
      hash: "e4129a08...f1027b99",
      seal: "BROKEN_BY_CUSTOMER",
      sealColor: "text-amber-400",
      accessories: "3 of 4",
      serial: "SN: 7492-X902-WH5",
    },
    findings: [
      "✓ Serial confirmed: exact match dispatch record",
      "✕ USB-C charging cable absent",
      "△ Cosmetic: 3mm scratch on left gimbal",
      "✓ ANC + drivers fully operational",
    ],
    decision: "Partial Refund — Deduct Cable ($15.00)",
  },
  {
    id: "c2",
    label: "Apple iPhone 16 Pro Max",
    order: "RP-9402-A1",
    decisionType: "rejected" as const,
    score: 12.0,
    dispatch: {
      timestamp: "Dec 15, 2026 · 11:30 UTC",
      hash: "9912bc0a...5541ea22",
      seal: "ORIGINAL_PULL_TAB",
      sealColor: "text-[#20C997]",
      accessories: "2 of 2",
      serial: "IMEI: 354829104928172",
    },
    returnData: {
      timestamp: "Dec 23, 2026 · 13:10 UTC",
      hash: "4a88019b...cc871400",
      seal: "RE-GLUED_NON_OEM",
      sealColor: "text-rose-400",
      accessories: "1 of 2",
      serial: "IMEI: 354899990182741 ⚠",
    },
    findings: [
      "✕ CRITICAL: Return IMEI ≠ dispatch unit",
      "✕ Device swap: blacklisted iPhone 14 Pro chassis",
      "✕ Third-party counterfeit adhesive detected",
      "✕ Handset flagged on national blacklist DB",
    ],
    decision: "Return Fraud Rejected — Dispute Report Generated",
  },
  {
    id: "c3",
    label: "Bottega Veneta Tote",
    order: "RP-7719-L3",
    decisionType: "approved" as const,
    score: 99.8,
    dispatch: {
      timestamp: "Dec 18, 2026 · 16:05 UTC",
      hash: "3381ea5b...10948c21",
      seal: "SECURITY_TAG_#BV-491",
      sealColor: "text-[#20C997]",
      accessories: "3 of 3",
      serial: "RFID: 0x48A901",
    },
    returnData: {
      timestamp: "Dec 24, 2026 · 11:18 UTC",
      hash: "6612df99...871b002c",
      seal: "TAG_INTACT_AUTHENTIC",
      sealColor: "text-[#20C997]",
      accessories: "3 of 3",
      serial: "RFID: 0x48A901",
    },
    findings: [
      "✓ Seal #BV-491: 100% intact and authenticated",
      "✓ RFID: matches merchant dispatch cryptography",
      "✓ Leather: zero creasing, zero corner wear (A+)",
      "✓ All accessories: dust bag + care cards present",
    ],
    decision: "100% Authorized — Instant Refund Dispatched",
  },
];

const decisionColors = {
  partial: { score: "text-amber-400", badge: "bg-amber-400/15 text-amber-300 border-amber-400/30", dot: "bg-amber-400" },
  rejected: { score: "text-rose-400", badge: "bg-rose-500/15 text-rose-300 border-rose-500/30", dot: "bg-rose-500" },
  approved: { score: "text-[#20C997]", badge: "bg-[#20C997]/15 text-[#20C997] border-[#20C997]/30", dot: "bg-[#20C997]" },
};

export function VerificationEngine() {
  const [active, setActive] = useState(0);
  const c = cases[active];
  const dc = decisionColors[c.decisionType];

  return (
    <section id="verification-engine" className="w-full py-24 sm:py-32 bg-[#09090c] border-y border-white/[0.05]">
      <div className="pw">

        {/* ── ASYMMETRIC 45/55 layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[45fr_55fr] gap-12 xl:gap-16 items-start">

          {/* LEFT: Heading + Description + Feature list */}
          <div className="flex flex-col space-y-7">
            <div>
              <div className="eyebrow eyebrow-green mb-5">Live Interactive Engine</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Compare.{" "}
                <span className="serif-accent gradient-text-blue">
                  Verify. Understand.
                </span>
              </h2>
            </div>

            <p className="text-base xl:text-lg text-zinc-400 leading-relaxed">
              ReturnProof cross-references the dispatch baseline against return
              intake evidence in milliseconds — surfacing fraud, missing accessories,
              and cosmetic discrepancies with AI precision.
            </p>

            <ul className="space-y-3.5">
              {[
                { icon: "🔍", text: "Multi-angle AI visual diff detects damage at sub-millimeter precision" },
                { icon: "🔐", text: "IMEI, serial, and RFID cross-match against original dispatch record" },
                { icon: "📋", text: "Accessories checklist automatically compared item by item" },
                { icon: "📄", text: "Instant dispute PDF generated with side-by-side photographic evidence" },
                { icon: "✅", text: "Automated verdicts reduce review time from days to seconds" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm xl:text-[15px] text-zinc-300">
                  <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Case selector tabs */}
            <div className="pt-4">
              <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-3">
                Interactive Test Cases:
              </div>
              <div className="flex flex-col gap-2">
                {cases.map((cs, i) => {
                  const dcs = decisionColors[cs.decisionType];
                  return (
                    <button
                      key={cs.id}
                      onClick={() => setActive(i)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        active === i
                          ? "bg-[#1a1a20] border-[#3867FF]/40 text-white"
                          : "bg-[#111115] border-white/[0.07] text-zinc-400 hover:text-zinc-200 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dcs.dot}`} />
                        <span>{cs.label}</span>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${dcs.badge}`}>
                        {cs.decisionType.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Large comparison console */}
          <div className="console-panel shadow-2xl shadow-black/70">
            {/* Console top bar */}
            <div className="console-topbar">
              <div>
                <span className="text-[11px] font-mono text-[#5e85ff] bg-[#3867FF]/12 px-2 py-0.5 rounded border border-[#3867FF]/25">
                  {c.order}
                </span>
                <span className="ml-2 text-[11px] text-zinc-500 font-mono">{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Match:</span>
                <span className={`text-lg font-bold font-mono ${dc.score}`}>
                  {c.score}%
                </span>
              </div>
            </div>

            {/* Side-by-side panels */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dispatch baseline */}
              <div className="rounded-xl bg-[#0d0d11] border border-white/[0.07] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#111116] border-b border-white/[0.05] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
                  <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                    Dispatch Baseline
                  </span>
                </div>
                {/* Viewfinder mockup */}
                <div className="h-36 bg-[#07070a] flex items-center justify-center relative bg-dark-grid">
                  <div className="border-2 border-dashed border-[#3867FF]/50 rounded-lg p-3 text-center">
                    <div className="text-[11px] font-mono text-[#85a8ff]">{c.dispatch.serial}</div>
                    <div className="text-[10px] text-zinc-500 mt-1">Factory Sealed · Full Package</div>
                  </div>
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-zinc-500">
                    {c.dispatch.timestamp}
                  </div>
                </div>
                <div className="p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Seal:</span>
                    <span className={c.dispatch.sealColor}>{c.dispatch.seal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Accessories:</span>
                    <span className="text-zinc-200">{c.dispatch.accessories}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-zinc-500">SHA-256:</span>
                    <span className="text-[#85a8ff]">{c.dispatch.hash}</span>
                  </div>
                </div>
              </div>

              {/* Return intake */}
              <div className="rounded-xl bg-[#0d0d11] border border-white/[0.07] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#111116] border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dc.dot}`} />
                    <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
                      Return Intake
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${dc.badge}`}>
                    {c.decisionType.toUpperCase()}
                  </span>
                </div>
                {/* Viewfinder mockup */}
                <div className="h-36 bg-[#07070a] flex items-center justify-center relative bg-dark-grid">
                  <div
                    className={`border-2 border-dashed rounded-lg p-3 text-center ${
                      c.decisionType === "rejected"
                        ? "border-rose-500/50 bg-rose-500/5"
                        : c.decisionType === "partial"
                        ? "border-amber-400/50 bg-amber-400/5"
                        : "border-[#20C997]/50 bg-[#20C997]/5"
                    }`}
                  >
                    <div className="text-[11px] font-mono text-zinc-200">{c.returnData.serial}</div>
                    <div className={`text-[10px] mt-1 font-semibold ${dc.score}`}>
                      {c.decisionType === "rejected" ? "FRAUD DETECTED" : c.decisionType === "partial" ? "DISCREPANCY FOUND" : "AUTHENTIC"}
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-zinc-500">
                    {c.returnData.timestamp}
                  </div>
                </div>
                <div className="p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Seal:</span>
                    <span className={c.returnData.sealColor}>{c.returnData.seal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Accessories:</span>
                    <span
                      className={
                        c.returnData.accessories !== c.dispatch.accessories
                          ? "text-amber-400 font-bold"
                          : "text-zinc-200"
                      }
                    >
                      {c.returnData.accessories}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-zinc-500">SHA-256:</span>
                    <span className="text-[#85a8ff]">{c.returnData.hash}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings + Action */}
            <div className="px-5 pb-5 space-y-4">
              <div className="rounded-xl bg-[#0a0a0e] border border-white/[0.05] p-4">
                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-3">
                  Automated Findings:
                </div>
                <ul className="space-y-1.5">
                  {c.findings.map((f, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-[#3867FF] text-xs mt-0.5 shrink-0">▸</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0d0d12] border border-white/[0.07]">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                    Recommended Action:
                  </div>
                  <div className={`text-sm font-semibold mt-0.5 ${dc.score}`}>
                    {c.decision}
                  </div>
                </div>
                <Button variant="primary" size="sm" className="shrink-0">
                  Export Evidence PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
