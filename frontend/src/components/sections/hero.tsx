"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerificationIndicator, TamperEvidentSeal } from "@/components/ui/badge";

export function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"delivery" | "unboxing" | "return">("unboxing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <section className="relative w-full overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 lg:pt-16 lg:pb-28 bg-white bg-ambient-glow bg-grid-pattern">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Main Responsive Grid: 2-Column on LG/XL displays, stacked on Mobile/Tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 2xl:gap-20 items-center">
          {/* Left Column: Headline, Description & Call To Action */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-6 text-left">
            {/* Top Pill Announcement */}
            <div>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
              >
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-blue-600 font-bold">New Release</span>
                <span className="text-slate-300">|</span>
                <span>AI-Assisted Return Verification Engine</span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Every Delivery. <br />
              Every Return. <br />
              <span className="text-blue-600">Every Proof.</span>
            </h1>

            {/* Product Description */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              ReturnProof is a digital chain-of-custody platform that captures,
              verifies and maintains product condition evidence during delivery,
              unboxing and returns.
            </p>

            {/* Email Form & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your business email"
                  className="h-12 flex-1 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
                <Button type="submit" size="md" variant="primary" className="h-12 px-6 whitespace-nowrap">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>

              {submitted && (
                <p className="text-xs font-semibold text-emerald-600 animate-fade-in">
                  ✓ Request received! Our deployment team will reach out within 24 hours.
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <a href="#how-it-works">
                  <Button variant="outline" size="sm" className="h-10 text-slate-700 hover:text-slate-900">
                    Explore Platform Architecture ↓
                  </Button>
                </a>
              </div>
            </div>

            {/* Trust and Verification Points */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Cryptographically Verified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                SHA-256 Immutable Audit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Real-Time AI Diffing
              </span>
            </div>
          </div>

          {/* Right Column: Full-Width Product Dashboard Preview */}
          <div className="lg:col-span-7 xl:col-span-7 w-full">
            <div className="relative w-full">
              {/* Soft Ambient Mesh Backdrop Behind Dashboard */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-emerald-500/15 blur-2xl opacity-75 pointer-events-none" />

              <div className="relative w-full rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden">
                {/* Console Window Chrome Header */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="ml-3 font-mono text-xs text-slate-500 hidden sm:inline">
                      console.returnproof.io/orders/RP-9842/evidence
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TamperEvidentSeal hash="a7f8c92de0148b52f10943" />
                    <VerificationIndicator label="Chain Intact" score={99.4} />
                  </div>
                </div>

                {/* Dashboard Inner Body */}
                <div className="p-5 sm:p-6 lg:p-7 space-y-6">
                  {/* Order Header Summary & Workflow Step Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-xl text-slate-900">Order #RP-9842</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Sony WH-1000XM5 Wireless Headphones
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Buyer: Alex Mercer • Seller: TechOmni Direct • Carrier: ExpressDelivery (TRK-881920)
                      </p>
                    </div>

                    {/* Step Switcher Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab("delivery")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === "delivery"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        1. Delivery Handover
                      </button>
                      <button
                        onClick={() => setActiveTab("unboxing")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === "unboxing"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        2. Unboxing Scan
                      </button>
                      <button
                        onClick={() => setActiveTab("return")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === "return"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        3. Return Verification
                      </button>
                    </div>
                  </div>

                  {/* Evidence Display & Metrics Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Visual Camera AI Inspection Feed */}
                    <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            {activeTab === "delivery" && "Original Packaging Sealed at Dispatch"}
                            {activeTab === "unboxing" && "Customer Unboxing Video Frame Analysis"}
                            {activeTab === "return" && "Return Inspection & Counterfeit Check"}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          SHA256: 4f1a...998b (Verified)
                        </span>
                      </div>

                      {/* Simulated Inspection Frame */}
                      <div className="relative rounded-lg border border-slate-300 bg-slate-900 text-white h-52 sm:h-60 flex flex-col items-center justify-center overflow-hidden">
                        {/* Overlay diagnostics */}
                        <div className="absolute inset-4 border border-dashed border-white/30 rounded pointer-events-none" />
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>AI VISION ACTIVE • 60 FPS</span>
                        </div>
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-300">
                          TIMESTAMP: 2026-11-06 14:22:08 UTC
                        </div>

                        {/* Center graphic */}
                        <div className="text-center space-y-2 z-10 p-4">
                          <Box className="h-12 w-12 text-blue-400 mx-auto opacity-80" />
                          <div className="text-sm font-semibold text-white">
                            {activeTab === "delivery" && "Serial Number: SN-99482-XM5-SLV Verified"}
                            {activeTab === "unboxing" && "Seal Integrity: 100% Intact • Accessories: 4/4 Present"}
                            {activeTab === "return" && "Condition Match: 99.4% Identical • 0 Cosmetic Faults"}
                          </div>
                          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Optical Match Confirmed
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              Barcode 884729103
                            </span>
                          </div>
                        </div>

                        {/* Bottom AI Overlay Data */}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs px-4 py-2 flex items-center justify-between text-[11px] text-slate-300 border-t border-white/10">
                          <span>Bounding Box: [X: 120, Y: 84, W: 640, H: 480]</span>
                          <span className="text-emerald-400 font-semibold">Status: PASS (Tamper-Free)</span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Metrics Side Panel */}
                    <div className="xl:col-span-5 space-y-4 flex flex-col justify-between">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Trust Verification Score
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-slate-900">99.4%</span>
                          <span className="text-xs font-semibold text-emerald-600">Grade A+ (Genuine)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full w-[99.4%]" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Automated Checklist
                        </span>
                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">Product Authenticity</span>
                          <span className="font-semibold text-emerald-600">✓ 100% Match</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">Original Packaging</span>
                          <span className="font-semibold text-emerald-600">✓ Unbroken Seal</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600">Included Accessories</span>
                          <span className="font-semibold text-emerald-600">✓ All Included</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-600">Fraud Risk Index</span>
                          <span className="font-semibold text-blue-600">0.01% (Minimal)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          Cryptographic evidence chain verified across seller, carrier, and buyer nodes.
                        </span>
                      </div>
                    </div>
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
