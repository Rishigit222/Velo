"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const cases = [
  {
    id: "c1",
    label: "Sony WH-1000XM5 Headphones",
    order: "RP-8821-X9",
    decisionType: "partial" as const,
    score: 92.4,
    dispatch: {
      timestamp: "Dec 12, 2026 · 09:14 UTC",
      hash: "7f83b165...bc6841e6",
      seal: "Factory Sealed",
      accessories: "4 of 4 present",
      serial: "SN: 7492-X902-WH5",
    },
    returnData: {
      timestamp: "Dec 20, 2026 · 15:42 UTC",
      hash: "e4129a08...f1027b99",
      seal: "Unsealed by Customer",
      accessories: "3 of 4 present",
      serial: "SN: 7492-X902-WH5",
    },
    findings: [
      "Hardware Serial: Verified exact match with origin record",
      "Missing Item: USB-C braided charging cable not present in return",
      "Cosmetic Assessment: 3mm superficial mark on left headband gimbal",
      "Audio Drivers & ANC: 100% operational and verified functional",
    ],
    decision: "Partial Refund Approved — Deduct Cable ($15.00)",
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
      seal: "Original Pull-Tab",
      accessories: "2 of 2 present",
      serial: "IMEI: 354829104928172",
    },
    returnData: {
      timestamp: "Dec 23, 2026 · 13:10 UTC",
      hash: "4a88019b...cc871400",
      seal: "Re-Glued Non-OEM",
      accessories: "1 of 2 present",
      serial: "IMEI: 354899990182741 (Mismatch)",
    },
    findings: [
      "Critical Discrepancy: Return IMEI does not match dispatch unit",
      "Chassis Substitution: Returned unit identified as older chassis model",
      "Adhesive Check: Non-factory thermal adhesive detected around display",
      "Database Status: Returned handset reported on blacklist database",
    ],
    decision: "Return Substitution Flagged — Dispute Package Prepared",
  },
  {
    id: "c3",
    label: "Bottega Veneta Leather Tote",
    order: "RP-7719-L3",
    decisionType: "approved" as const,
    score: 99.8,
    dispatch: {
      timestamp: "Dec 18, 2026 · 16:05 UTC",
      hash: "3381ea5b...10948c21",
      seal: "Security Tag #BV-491",
      accessories: "3 of 3 present",
      serial: "RFID: 0x48A901",
    },
    returnData: {
      timestamp: "Dec 24, 2026 · 11:18 UTC",
      hash: "6612df99...871b002c",
      seal: "Tag Intact & Verified",
      accessories: "3 of 3 present",
      serial: "RFID: 0x48A901",
    },
    findings: [
      "Security Tag #BV-491: 100% intact with authentic cryptographic seal",
      "RFID Transponder: Cryptographically matched against merchant manifest",
      "Material Assessment: Zero creasing, zero corner abrasion (Grade A+)",
      "Accessories Verified: Original protective dust bag and documentation enclosed",
    ],
    decision: "Return Approved — Automated Instant Refund Authorized",
  },
];

const decisionStyles = {
  partial: {
    score: "text-[#D4A359]",
    badge: "bg-[#D4A359]/10 text-[#D4A359] border-[#D4A359]/25",
    dot: "bg-[#D4A359]",
  },
  rejected: {
    score: "text-[#D9534F]",
    badge: "bg-[#D9534F]/10 text-[#D9534F] border-[#D9534F]/25",
    dot: "bg-[#D9534F]",
  },
  approved: {
    score: "text-[#49B99A]",
    badge: "bg-[#49B99A]/10 text-[#49B99A] border-[#49B99A]/25",
    dot: "bg-[#49B99A]",
  },
};

export function VerificationEngine() {
  const [active, setActive] = useState(0);
  const c = cases[active];
  const ds = decisionStyles[c.decisionType];

  return (
    <section id="verification-engine" className="w-full py-24 sm:py-32 bg-[#0B0B0B] border-y border-white/[0.06] relative">
      <div className="pw">

        {/* ── ASYMMETRIC 45/55 layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[45fr_55fr] gap-12 xl:gap-16 items-start">

          {/* LEFT: Heading + Description + Feature list */}
          <div className="flex flex-col space-y-7">
            <div>
              <div className="eyebrow mb-5">Verification Engine</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Compare.{" "}
                <span className="serif-accent silver-gradient-text">
                  Verify. Understand.
                </span>
              </h2>
            </div>

            <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed">
              Velo cross-references the dispatch baseline against return
              intake evidence in seconds — surfacing product swaps, missing accessories,
              and condition discrepancies with verifiable certainty.
            </p>

            <ul className="space-y-3.5">
              {[
                { icon: "01", title: "Automated Visual Difference", desc: "Compares delivery baseline against return photos side by side." },
                { icon: "02", title: "Hardware Identity Matching", desc: "Serial numbers, IMEI tags, and RFID codes cross-referenced to order." },
                { icon: "03", title: "Itemized Accessories Checklist", desc: "Every cable, manual, and enclosure audited against original package." },
                { icon: "04", title: "Instant Evidence PDF Export", desc: "Standardized dispute documentation ready for merchant or payment review." },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3.5 text-sm xl:text-[15px] text-[#A3A3A3]">
                  <span className="font-mono text-xs font-semibold text-[#777777] bg-[#1A1A1A] border border-white/[0.08] px-2 py-0.5 rounded shrink-0 mt-0.5">
                    {item.icon}
                  </span>
                  <span>
                    <strong className="text-white font-medium mr-1.5">{item.title}:</strong>
                    {item.desc}
                  </span>
                </li>
              ))}
            </ul>

            {/* Case selector tabs */}
            <div className="pt-3">
              <div className="text-xs text-[#777777] font-mono uppercase tracking-wider mb-3">
                Select Demonstration Case:
              </div>
              <div className="flex flex-col gap-2">
                {cases.map((cs, i) => {
                  const s = decisionStyles[cs.decisionType];
                  return (
                    <button
                      key={cs.id}
                      onClick={() => setActive(i)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        active === i
                          ? "bg-[#1C1C1F] border-white/20 text-white"
                          : "bg-[#141416] border-white/[0.07] text-[#A3A3A3] hover:text-white hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                        <span>{cs.label}</span>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${s.badge}`}>
                        {cs.decisionType.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Large comparison console in charcoal styling */}
          <div className="console-panel shadow-2xl">
            {/* Console top bar */}
            <div className="console-topbar">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-white bg-white/[0.08] px-2 py-0.5 rounded border border-white/[0.1]">
                  {c.order}
                </span>
                <span className="text-xs text-[#A3A3A3] font-medium hidden sm:inline">
                  {c.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777777]">Condition Match:</span>
                <span className={`text-base font-semibold ${ds.score}`}>
                  {c.score}%
                </span>
              </div>
            </div>

            {/* Side-by-side comparison panels */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dispatch baseline */}
              <div className="rounded-xl bg-[#191919] border border-white/[0.07] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#1E1E1E] border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Dispatch Baseline
                  </span>
                  <span className="text-[10px] text-[#777777] font-mono">ORIGIN</span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#141414] border border-white/[0.05] text-center">
                    <div className="font-mono text-xs text-white">{c.dispatch.serial}</div>
                    <div className="text-[11px] text-[#777777] mt-0.5">Recorded at merchant facility</div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[#777777]">
                      <span>Seal Status:</span>
                      <span className="text-white font-medium">{c.dispatch.seal}</span>
                    </div>
                    <div className="flex justify-between text-[#777777]">
                      <span>Accessories:</span>
                      <span className="text-[#A3A3A3]">{c.dispatch.accessories}</span>
                    </div>
                    <div className="flex justify-between text-[#777777] pt-1 border-t border-white/[0.04]">
                      <span>Timestamp:</span>
                      <span className="text-[#A3A3A3] font-mono text-[11px]">{c.dispatch.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return intake */}
              <div className="rounded-xl bg-[#191919] border border-white/[0.07] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#1E1E1E] border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    Return Intake
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${ds.badge}`}>
                    {c.decisionType.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 space-y-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-[#141414] border border-white/[0.05] text-center">
                    <div className="font-mono text-xs text-white">{c.returnData.serial}</div>
                    <div className="text-[11px] text-[#777777] mt-0.5">Received at return center</div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[#777777]">
                      <span>Seal Status:</span>
                      <span className="text-white font-medium">{c.returnData.seal}</span>
                    </div>
                    <div className="flex justify-between text-[#777777]">
                      <span>Accessories:</span>
                      <span className="text-[#A3A3A3]">{c.returnData.accessories}</span>
                    </div>
                    <div className="flex justify-between text-[#777777] pt-1 border-t border-white/[0.04]">
                      <span>Timestamp:</span>
                      <span className="text-[#A3A3A3] font-mono text-[11px]">{c.returnData.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings + Action */}
            <div className="px-5 sm:px-6 pb-6 space-y-4">
              <div className="rounded-xl bg-[#161616] border border-white/[0.06] p-4">
                <div className="text-xs font-medium text-white mb-2.5">
                  Automated Condition Findings:
                </div>
                <ul className="space-y-1.5 text-xs text-[#A3A3A3]">
                  {c.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#777777] mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-white/[0.08]">
                <div>
                  <div className="text-[11px] text-[#777777] uppercase tracking-wider">
                    Recommended Resolution:
                  </div>
                  <div className={`text-sm font-semibold mt-0.5 ${ds.score}`}>
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
