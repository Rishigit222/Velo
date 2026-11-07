"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = ["Dispatch", "Unboxing", "Return"];

  const stepContent = {
    1: {
      label: "DISPATCH_SCAN_01 • 2026-12-18 09:14:04 UTC",
      status: "Factory seal verified • SHA-256 baseline sealed",
      finding: "SEAL: INTACT [PASS] • SN: 7492-X902-WH5",
      findingColor: "text-[#20C997]",
    },
    2: {
      label: "UNBOX_SCAN_02 • 2026-12-18 14:32:09 UTC",
      status: "AI vision scan active • 4 accessories confirmed",
      finding: "OBJ: RETAIL_BOX • CONF: 99.8% • EXIF_VERIFIED",
      findingColor: "text-[#85a8ff]",
    },
    3: {
      label: "RETURN_SCAN_03 • 2026-12-22 16:45:12 UTC",
      status: "Condition diff complete • 1 discrepancy flagged",
      finding: "USB-C cable absent • Cosmetic: 3mm scratch left gimbal",
      findingColor: "text-amber-400",
    },
  };

  const content = stepContent[activeStep as keyof typeof stepContent];

  return (
    <section className="relative w-full min-h-screen flex items-center pt-20 pb-16 dark-hero-glow overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-dark-grid opacity-50 pointer-events-none" />

      <div className="pw w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[46fr_54fr] gap-10 xl:gap-16 items-center">

          {/* ═══════════════════════════════════════
              LEFT COLUMN — Copy & CTAs
          ═══════════════════════════════════════ */}
          <div className="flex flex-col space-y-7">

            {/* Eyebrow badge */}
            <div className="eyebrow max-w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3867FF] animate-pulse" />
              Custody Protocol v2.0 — Now Live
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl 2xl:text-[80px] font-bold tracking-tight text-white leading-[1.05]">
              Every Delivery.
              <br />
              Every Return.
              <br />
              <span className="serif-accent gradient-text-blue">
                Every Proof.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg xl:text-xl text-zinc-400 leading-relaxed max-w-lg">
              ReturnProof cryptographically records, verifies, and locks product
              condition across dispatch, unboxing, and returns — stopping false
              damage claims and return fraud before they happen.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="#cta">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-semibold text-[15px] px-8 h-12"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link href="#verification-engine">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-[15px] px-7 h-12 gap-2 group"
                >
                  <span>Explore Platform</span>
                  <svg className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Trust metrics */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/[0.07]">
              <div>
                <div className="text-2xl font-bold text-white font-mono">SHA-256</div>
                <div className="text-xs text-zinc-500 mt-0.5 tracking-wide">Cryptographic Seal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">100%</div>
                <div className="text-xs text-zinc-500 mt-0.5 tracking-wide">Audit Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#20C997] font-mono">99.4%</div>
                <div className="text-xs text-zinc-500 mt-0.5 tracking-wide">AI Vision Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">41+</div>
                <div className="text-xs text-zinc-500 mt-0.5 tracking-wide">Platform Tests Passing</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT COLUMN — Product Console
          ═══════════════════════════════════════ */}
          <div className="relative">
            {/* Ambient glow behind console */}
            <div className="absolute -inset-10 bg-[#3867FF]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative console-panel shadow-2xl shadow-black">
              {/* Top bar */}
              <div className="console-topbar">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="text-xs font-mono text-zinc-400 ml-3">
                    console.returnproof.app / session / rp-9482
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#20C997] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
                  Live Chain Active
                </div>
              </div>

              {/* Order header */}
              <div className="p-5 bg-[#141418] border-b border-white/[0.06] flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-[#5e85ff] bg-[#3867FF]/12 px-2 py-0.5 rounded border border-[#3867FF]/25">
                      SESSION #RP-9482
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Dec 18, 2026</span>
                  </div>
                  <div className="text-base font-semibold text-white">
                    Sony WH-1000XM5 Wireless Headphones
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Buyer: Alex C. · Merchant: Apex Audio Direct
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-zinc-500 font-mono">Trust Score</div>
                  <div className="text-2xl font-bold font-mono text-[#20C997]">99.4%</div>
                </div>
              </div>

              {/* Step tabs */}
              <div className="grid grid-cols-3 bg-[#0c0c0f] border-b border-white/[0.06]">
                {steps.map((step, i) => {
                  const idx = i + 1;
                  const isActive = activeStep === idx;
                  const isDone = idx < activeStep;
                  return (
                    <button
                      key={step}
                      onClick={() => setActiveStep(idx)}
                      className={`py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#16161c] text-white border-b-2 border-[#3867FF]"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                          isDone
                            ? "bg-[#20C997]/20 text-[#20C997]"
                            : isActive
                            ? "bg-[#3867FF] text-white"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {isDone ? "✓" : idx}
                      </span>
                      {idx}. {step}
                    </button>
                  );
                })}
              </div>

              {/* Main content area */}
              <div className="p-5 bg-[#0e0e12] space-y-4">
                {/* Viewfinder */}
                <div className="relative w-full h-52 rounded-xl bg-[#060609] border border-white/[0.08] overflow-hidden bg-dark-grid">
                  {/* Scan line animation */}
                  <div className="scan-line" />

                  {/* Top HUD */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[11px] font-mono z-10">
                    <span className="flex items-center gap-1.5 text-[#20C997] bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#20C997] animate-pulse" />
                      AI SCAN ACTIVE
                    </span>
                    <span className="text-zinc-400">4K · 60fps · RAW</span>
                  </div>

                  {/* Bounding box target */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-44 h-28 border-2 border-dashed border-[#3867FF]/70 rounded-lg bg-[#3867FF]/[0.04] flex flex-col items-center justify-center gap-2 p-3">
                      <div className="flex justify-between w-full text-[10px] font-mono text-[#7ba2ff]">
                        <span>OBJ: RETAIL_BOX</span>
                        <span>CONF: 99.8%</span>
                      </div>
                      <span className="text-xs font-mono text-white bg-black/60 px-2 py-0.5 rounded border border-white/10">
                        SN: 7492-X902-WH5
                      </span>
                      <span className="text-[10px] font-mono text-[#20C997] self-end">
                        SEAL: INTACT [PASS]
                      </span>
                    </div>
                  </div>

                  {/* Bottom HUD */}
                  <div className="absolute bottom-3 inset-x-3 flex justify-between text-[11px] font-mono text-zinc-500 z-10">
                    <span>GPS: 37.7749°N, 122.4194°W</span>
                    <span className="text-[#3867FF]">EXIF_VERIFIED</span>
                  </div>
                </div>

                {/* SHA-256 seal row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111115] border border-white/[0.06] font-mono text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-[#3867FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>SHA-256:</span>
                    <span className="text-[#85a8ff]">a3f892c90e14bf27a059...f92b</span>
                  </div>
                  <span className="text-[#20C997] font-semibold">Immutable</span>
                </div>

                {/* Step-specific status */}
                <div className="p-3 rounded-xl bg-[#111115] border border-white/[0.06] space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-500">{content.label}</div>
                  <div className="text-xs text-zinc-300">{content.status}</div>
                  <div className={`text-xs font-mono font-semibold ${content.findingColor}`}>
                    {content.finding}
                  </div>
                </div>

                {/* Quick metrics grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Factory Seal", val: "✓ Intact", color: "text-[#20C997]" },
                    { label: "Serial Match", val: "✓ 100%", color: "text-[#20C997]" },
                    { label: "Condition", val: "Grade A", color: "text-white" },
                    { label: "Accessories", val: "4 / 4", color: "text-[#85a8ff]" },
                  ].map((m) => (
                    <div key={m.label} className="p-2 rounded-lg bg-[#0c0c0f] border border-white/[0.05] text-center">
                      <div className="text-[10px] text-zinc-500 leading-none mb-1">{m.label}</div>
                      <div className={`text-[11px] font-semibold leading-none ${m.color}`}>{m.val}</div>
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
