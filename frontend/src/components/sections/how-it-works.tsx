import React from "react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      tag: "Merchant Dispatch",
      title: "Delivery Handover & Sealing",
      desc: "The merchant records packaging condition, barcode, and factory seal state. A SHA-256 baseline digest is computed client-side and sealed to the order ledger before carrier pickup — creating an immutable origin reference.",
      hash: "e892c4...71b2",
      timestamp: "Dec 14, 10:22 UTC",
      status: "SEAL VERIFIED",
      statusHighlight: true,
      icon: (
        <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
    },
    {
      num: "02",
      tag: "Customer Receipt",
      title: "AI-Assisted Unboxing Capture",
      desc: "The buyer launches a guided Velo session to record unboxing in real time. Visual verification ensures box seals, serial numbers, and all accessories are captured, hashed, and notarized with atomic UTC timestamps.",
      hash: "a492f1...c890",
      timestamp: "Dec 18, 14:32 UTC",
      status: "UNBOX CERTIFIED",
      statusHighlight: false,
      icon: (
        <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      num: "03",
      tag: "Return Logistics",
      title: "Verified Return & Handover",
      desc: "Return evidence is automatically cross-referenced against the dispatch baseline. Any discrepancy — scratch, missing accessory, serial mismatch — is flagged with an automated audit report ready for resolution.",
      hash: "b773a9...994e",
      timestamp: "Dec 22, 16:45 UTC",
      status: "DIFF RESOLVED",
      statusHighlight: false,
      icon: (
        <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
          <polyline points="18 8 22 12 18 16" />
          <line x1="6" y1="12" x2="22" y2="12" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32 bg-[#0B0B0B] border-t border-white/[0.06] relative">
      <div className="pw">

        {/* ── Section header: left label, right description ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 lg:mb-16">
          <div className="max-w-xl">
            <div className="eyebrow mb-5">Three-Step Protocol</div>
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
              From Dispatch to Return.{" "}
              <span className="serif-accent silver-gradient-text">
                Every Moment Has Proof.
              </span>
            </h2>
          </div>
          <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed max-w-sm lg:max-w-xs xl:max-w-sm text-left lg:text-right pb-1">
            A continuous cryptographic audit trail linking seller dispatch, buyer unboxing, and return logistics in one tamper-evident record.
          </p>
        </div>

        {/* ── Three charcoal cards spanning full width ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col card-charcoal rounded-2xl overflow-hidden group"
            >
              {/* Header area */}
              <div className="p-7 sm:p-8 flex flex-col space-y-5 flex-1">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#222222] border border-white/[0.08] flex items-center justify-center transition-colors group-hover:border-white/20">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-bold text-white/[0.12] group-hover:text-white/[0.25] transition-colors leading-none">
                    {step.num}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                    {step.tag}
                  </span>
                  <h3 className="text-xl xl:text-2xl font-semibold text-white mt-1.5 leading-snug">
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm xl:text-[15px] text-[#A3A3A3] leading-relaxed flex-1">
                  {step.desc}
                </p>
              </div>

              {/* Refined Evidence readout panel */}
              <div className="mx-6 mb-6 rounded-xl bg-[#141414] border border-white/[0.06] p-4 text-xs space-y-2">
                <div className="flex justify-between text-[#777777]">
                  <span>Evidence Hash:</span>
                  <span className="font-mono text-[#D4D4D4]">{step.hash}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Timestamp:</span>
                  <span className="text-[#A3A3A3]">{step.timestamp}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.05] flex justify-between items-center">
                  <span className="text-[#777777]">Status:</span>
                  <span className={`text-[11px] font-medium ${step.statusHighlight ? "text-[#49B99A]" : "text-[#D4D4D4]"}`}>
                    {step.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
