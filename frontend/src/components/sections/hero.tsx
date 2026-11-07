"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = ["Dispatch", "Unboxing", "Return"];

  const stepDetails = {
    1: {
      date: "Dec 18, 2026 · 09:14 UTC",
      title: "Dispatch Baseline Registered",
      summary: "Package inspected and factory seal verified before carrier handover. Immutable SHA-256 seal generated.",
      metrics: [
        { label: "Factory Seal", val: "Intact", highlight: true },
        { label: "Serial Number", val: "7492-X902", highlight: false },
        { label: "Package State", val: "Pristine", highlight: false },
        { label: "Items Included", val: "4 of 4", highlight: false },
      ],
    },
    2: {
      date: "Dec 18, 2026 · 14:32 UTC",
      title: "Customer Unboxing Certified",
      summary: "Customer recorded unboxing via guided web flow. All accessories confirmed intact upon arrival.",
      metrics: [
        { label: "Delivery Match", val: "100%", highlight: true },
        { label: "Serial Verified", val: "Matched", highlight: true },
        { label: "Outer Box", val: "Undamaged", highlight: false },
        { label: "Accessories", val: "All Present", highlight: false },
      ],
    },
    3: {
      date: "Dec 22, 2026 · 16:45 UTC",
      title: "Return Intake Inspection",
      summary: "Return package checked against baseline. Minor superficial mark noted on left headband gimbal.",
      metrics: [
        { label: "Condition Delta", val: "92.4% Match", highlight: false },
        { label: "Missing Cable", val: "USB-C (-$15)", highlight: false },
        { label: "Drivers & ANC", val: "Functional", highlight: true },
        { label: "Recommendation", val: "Partial Refund", highlight: false },
      ],
    },
  };

  const current = stepDetails[activeStep as keyof typeof stepDetails];

  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 pb-20 charcoal-hero-glow overflow-hidden">
      <div className="pw w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[46fr_54fr] gap-10 xl:gap-16 items-center">

          {/* ═══════════════════════════════════════
              LEFT COLUMN — Typography & CTAs
          ═══════════════════════════════════════ */}
          <div className="flex flex-col space-y-8">

            {/* Eyebrow badge */}
            <div className="eyebrow max-w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4D4D4]" />
              Custody Protocol v2.0
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl 2xl:text-[78px] font-bold tracking-tight text-white leading-[1.04]">
              Every Delivery.
              <br />
              Every Return.
              <br />
              <span className="serif-accent silver-gradient-text">
                Every Proof.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg xl:text-xl text-[#A3A3A3] leading-relaxed max-w-lg font-normal">
              ReturnProof cryptographically records, verifies, and locks product
              condition across dispatch, unboxing, and returns — stopping false
              damage claims and return fraud before they happen.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Link href="#cta">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-8"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="#verification-engine">
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-7 gap-2 group"
                >
                  <span>Explore Platform</span>
                  <svg className="w-4 h-4 text-[#A3A3A3] group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Key trust numbers */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/[0.08]">
              <div>
                <div className="text-2xl font-semibold text-white">SHA-256</div>
                <div className="text-xs text-[#777777] mt-0.5 tracking-wide">Cryptographic Seal</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">100%</div>
                <div className="text-xs text-[#777777] mt-0.5 tracking-wide">Audit Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[#F5F5F5]">99.4%</div>
                <div className="text-xs text-[#777777] mt-0.5 tracking-wide">Verification Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[#D4D4D4]">41+</div>
                <div className="text-xs text-[#777777] mt-0.5 tracking-wide">Automated Test Audits</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT COLUMN — Refined Charcoal Product Console
          ═══════════════════════════════════════ */}
          <div className="relative">
            {/* Soft silver-grey atmospheric illumination behind console */}
            <div className="absolute -inset-10 bg-white/[0.03] blur-[70px] rounded-full pointer-events-none" />

            <div className="relative console-panel">
              {/* Top window bar */}
              <div className="console-topbar">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="text-xs text-[#777777] ml-2 font-mono">
                    console.returnproof.app / session / rp-9482
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#D4D4D4] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A]" />
                  Chain Active
                </div>
              </div>

              {/* Order header card */}
              <div className="p-5 sm:p-6 bg-[#171717] border-b border-white/[0.07] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-[#D4D4D4] bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                      ORDER #RP-9482
                    </span>
                    <span className="text-[11px] text-[#777777]">Dec 18, 2026</span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold text-white">
                    Sony WH-1000XM5 Wireless Headphones
                  </div>
                  <div className="text-xs text-[#A3A3A3] mt-0.5">
                    Buyer: Alex C. · Merchant: Apex Audio Direct
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-[#777777]">Trust Score</div>
                  <div className="text-2xl font-semibold text-white">99.4%</div>
                </div>
              </div>

              {/* Step tabs */}
              <div className="grid grid-cols-3 bg-[#111111] border-b border-white/[0.07]">
                {steps.map((step, i) => {
                  const idx = i + 1;
                  const isActive = activeStep === idx;
                  const isDone = idx < activeStep;
                  return (
                    <button
                      key={step}
                      onClick={() => setActiveStep(idx)}
                      className={`py-3 px-3 flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#1E1E1E] text-white border-b-2 border-white/60"
                          : "text-[#777777] hover:text-[#D4D4D4]"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-medium ${
                          isDone
                            ? "bg-white/10 text-white"
                            : isActive
                            ? "bg-white text-[#0a0a0a]"
                            : "bg-[#222222] text-[#777777]"
                        }`}
                      >
                        {isDone ? "✓" : idx}
                      </span>
                      {idx}. {step}
                    </button>
                  );
                })}
              </div>

              {/* Main content body */}
              <div className="p-5 sm:p-6 bg-[#141414] space-y-4">
                {/* Visual inspection panel */}
                <div className="p-5 rounded-xl bg-[#1B1B1B] border border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">
                      {current.title}
                    </span>
                    <span className="text-[11px] font-mono text-[#777777]">
                      {current.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                    {current.summary}
                  </p>
                </div>

                {/* Evidence digest row */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/[0.07] text-xs">
                  <div className="flex items-center gap-2 text-[#A3A3A3]">
                    <svg className="w-3.5 h-3.5 text-[#D4D4D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>Evidence Seal:</span>
                    <span className="font-mono text-[#D4D4D4]">a3f892c90e14...f92b</span>
                  </div>
                  <span className="text-xs font-medium text-[#D4D4D4] bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                    SHA-256 Locked
                  </span>
                </div>

                {/* Metrics 4-column grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {current.metrics.map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-[#191919] border border-white/[0.06]">
                      <div className="text-[10px] text-[#777777] uppercase tracking-wider mb-1">
                        {m.label}
                      </div>
                      <div className={`text-xs font-semibold ${m.highlight ? "text-[#49B99A]" : "text-white"}`}>
                        {m.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
