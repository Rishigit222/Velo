"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, VerificationBadge } from "@/components/ui/badge";

export function Hero() {
  const [activeStep, setActiveStep] = useState<number>(2); // 1 = Dispatch, 2 = Unboxing, 3 = Return

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden dark-hero-glow">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#3867FF]/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-[#20C997]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left">
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all max-w-fit shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#3867FF] animate-pulse" />
              <span className="text-xs font-medium text-zinc-300">
                Next-Gen Custody Protocol 2.0
              </span>
              <span className="text-[11px] font-mono text-[#79a0ff] font-semibold flex items-center gap-0.5">
                Explore →
              </span>
            </div>

            {/* Main Headline with Serif Accent */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Every Delivery.
              <br />
              Every Return.
              <br />
              <span className="font-[family-name:var(--font-serif)] italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#507dff] via-[#8bb0ff] to-[#20C997]">
                Every Proof.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 font-normal leading-relaxed max-w-xl">
              ReturnProof is the digital chain-of-custody platform that
              cryptographically records, verifies, and preserves product
              condition across dispatch, unboxing, and returns — stopping false
              damage claims and return fraud before they happen.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="#cta">
                <Button variant="primary" size="lg" className="font-semibold text-base px-8 py-3.5">
                  Get Started Free
                </Button>
              </Link>

              <Link href="#verification-engine">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-base px-7 py-3.5 flex items-center gap-2 group"
                >
                  <span>Explore Platform</span>
                  <svg
                    className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators / Badges */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  100%
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cryptographic Audit
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  SHA-256
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Client & Server Seal
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#20C997] tracking-tight">
                  99.4%
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  AI Condition Accuracy
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Product Console Preview */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-2xl bg-[#111113] border border-white/[0.12] shadow-2xl shadow-black/80 overflow-hidden">
              {/* Console Window Header */}
              <div className="px-5 py-3.5 bg-[#17171a] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-zinc-400 ml-2">
                    console.returnproof.app/session/rp-9482
                  </span>
                </div>
                <VerificationBadge label="Live Chain Active" />
              </div>

              {/* Order Meta Header */}
              <div className="p-5 sm:p-6 bg-[#141417] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#5e85ff] bg-[#3867FF]/15 px-2 py-0.5 rounded border border-[#3867FF]/30">
                      SESSION #RP-9482
                    </span>
                    <span className="text-xs text-zinc-400">
                      Dec 18, 2026 • 14:32:09 UTC
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    Sony WH-1000XM5 Wireless Headphones
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Buyer: Alex C. (Verified) • Merchant: Apex Audio Direct
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-zinc-400 block">Trust Score</span>
                  <span className="text-2xl font-bold font-mono text-[#20C997]">
                    99.4%
                  </span>
                </div>
              </div>

              {/* Stepper Tabs */}
              <div className="grid grid-cols-3 bg-[#0d0d10] border-b border-white/[0.08] text-xs font-medium">
                <button
                  onClick={() => setActiveStep(1)}
                  className={`py-3 px-3 flex items-center justify-center gap-1.5 transition-all ${
                    activeStep === 1
                      ? "bg-[#18181d] text-white border-b-2 border-[#3867FF]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>1. Dispatch</span>
                </button>

                <button
                  onClick={() => setActiveStep(2)}
                  className={`py-3 px-3 flex items-center justify-center gap-1.5 transition-all ${
                    activeStep === 2
                      ? "bg-[#18181d] text-white border-b-2 border-[#3867FF]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#3867FF] text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>2. Unboxing</span>
                </button>

                <button
                  onClick={() => setActiveStep(3)}
                  className={`py-3 px-3 flex items-center justify-center gap-1.5 transition-all ${
                    activeStep === 3
                      ? "bg-[#18181d] text-white border-b-2 border-[#3867FF]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-400 text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>3. Return</span>
                </button>
              </div>

              {/* Console Body: Live Inspection Viewfinder */}
              <div className="p-5 sm:p-6 space-y-5 bg-[#0f0f12]">
                {/* Viewfinder Screen */}
                <div className="relative w-full h-56 sm:h-64 rounded-xl bg-[#08080a] border border-white/10 overflow-hidden flex flex-col justify-between p-4 bg-dark-grid">
                  {/* Top viewfinder overlay */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      AI VISION SCAN ACTIVE
                    </span>
                    <span className="text-zinc-400">4K • 60 FPS • RAW_EVIDENCE</span>
                  </div>

                  {/* Center Scanning Target with Bounding Box */}
                  <div className="absolute inset-0 m-auto w-48 h-32 sm:w-56 sm:h-36 rounded-lg border-2 border-dashed border-[#3867FF] bg-[#3867FF]/5 flex flex-col items-center justify-center p-2 backdrop-blur-[1px]">
                    <div className="w-full flex justify-between text-[10px] font-mono text-[#7ba2ff] px-1">
                      <span>OBJ: RETAIL_BOX</span>
                      <span>CONF: 99.8%</span>
                    </div>
                    <div className="my-auto text-center">
                      <span className="text-xs font-mono font-semibold text-white bg-black/60 px-2 py-1 rounded border border-white/15">
                        SN: 7492-X902-WH5
                      </span>
                    </div>
                    <div className="w-full text-right text-[10px] font-mono text-[#20C997]">
                      SEAL: INTACT [PASS]
                    </div>
                  </div>

                  {/* Bottom Viewfinder Info */}
                  <div className="flex items-end justify-between z-10 text-xs font-mono text-zinc-400">
                    <span>GPS: 37.7749° N, 122.4194° W</span>
                    <span className="text-[#3867FF]">EXIF_VERIFIED</span>
                  </div>
                </div>

                {/* Evidence Hash Seal Bar */}
                <div className="p-3 rounded-lg bg-[#151518] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-[#3867FF]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="text-xs font-mono text-zinc-300">
                      SHA-256 Digest:
                    </span>
                    <span className="text-xs font-mono text-[#85a8ff] truncate max-w-[180px] sm:max-w-[260px]">
                      a3f892c90e14bf27a059...f92b
                    </span>
                  </div>
                  <Badge variant="success" size="sm" className="max-w-fit">
                    Immutable Record
                  </Badge>
                </div>

                {/* Inspection Findings Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#131316] border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-400 block">Factory Seal</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      ✓ Tamper-Free
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#131316] border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-400 block">Serial Match</span>
                    <span className="text-xs font-semibold text-emerald-400">
                      ✓ 100% Verified
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#131316] border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-400 block">Cosmetic State</span>
                    <span className="text-xs font-semibold text-white">
                      Pristine (Grade A)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#131316] border border-white/[0.06]">
                    <span className="text-[11px] text-zinc-400 block">Accessories</span>
                    <span className="text-xs font-semibold text-[#85a8ff]">
                      4 of 4 Detected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
