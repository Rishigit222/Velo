import React from "react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      tag: "Merchant Dispatch",
      title: "Delivery Handover & Sealing",
      desc: "The merchant records packaging condition, barcode, and factory seal state. A SHA-256 baseline digest is computed client-side and sealed to the order ledger before carrier pickup — creating the immutable origin reference.",
      hash: "e892c4...71b2",
      timestamp: "Dec 14, 10:22 UTC",
      status: "SEAL_VERIFIED",
      statusColor: "text-[#20C997]",
      icon: (
        <svg className="w-6 h-6 text-[#3867FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      ),
      barWidth: "w-full",
      barColor: "bg-[#20C997]",
    },
    {
      num: "02",
      tag: "Customer Receipt",
      title: "AI-Assisted Unboxing Capture",
      desc: "The buyer launches a guided ReturnProof session to record unboxing in real time. AI prompts ensure box seals, serial numbers, and all accessories are captured, hashed, and notarized with GPS and atomic UTC timestamps.",
      hash: "a492f1...c890",
      timestamp: "Dec 18, 14:32 UTC",
      status: "UNBOX_CERTIFIED",
      statusColor: "text-[#85a8ff]",
      icon: (
        <svg className="w-6 h-6 text-[#20C997]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      barWidth: "w-2/3",
      barColor: "bg-[#3867FF]",
    },
    {
      num: "03",
      tag: "Return Logistics",
      title: "Verified Return & Handover",
      desc: "Return evidence is automatically diffed against the dispatch baseline. Any discrepancy — scratch, missing accessory, serial mismatch — is flagged with an AI-generated audit report ready for the dispute portal.",
      hash: "b773a9...994e",
      timestamp: "Dec 22, 16:45 UTC",
      status: "DIFF_RESOLVED",
      statusColor: "text-amber-400",
      icon: (
        <svg className="w-6 h-6 text-[#5b85ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
          <polyline points="18 8 22 12 18 16" />
          <line x1="6" y1="12" x2="22" y2="12" />
        </svg>
      ),
      barWidth: "w-1/3",
      barColor: "bg-amber-400",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32 bg-[#0a0a0d] border-t border-white/[0.05]">
      <div className="pw">

        {/* ── Section header: left label, right description ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14 lg:mb-16">
          <div className="max-w-xl">
            <div className="eyebrow mb-5">Three-Step Protocol</div>
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
              From Dispatch to Return.{" "}
              <span className="serif-accent gradient-text-blue">
                Every Moment Has Proof.
              </span>
            </h2>
          </div>
          <p className="text-base xl:text-lg text-zinc-400 leading-relaxed max-w-sm lg:max-w-xs xl:max-w-sm text-left lg:text-right pb-1">
            A continuous cryptographic audit trail linking seller dispatch, buyer unboxing, and return logistics in one tamper-evident record.
          </p>
        </div>

        {/* ── Three cards spanning full width ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col bg-[#121216] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300 group"
            >
              {/* Card top accent bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#3867FF]/30 to-transparent" />

              {/* Header area */}
              <div className="p-7 flex flex-col space-y-5 flex-1">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-mono text-4xl font-extrabold text-white/[0.08] group-hover:text-[#3867FF]/20 transition-colors leading-none">
                    {step.num}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    {step.tag}
                  </span>
                  <h3 className="text-xl xl:text-2xl font-semibold text-white mt-1.5 leading-tight">
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm xl:text-[15px] text-zinc-400 leading-relaxed flex-1">
                  {step.desc}
                </p>
              </div>

              {/* Evidence readout panel */}
              <div className="mx-5 mb-5 rounded-xl bg-[#09090c] border border-white/[0.05] p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between text-zinc-500">
                  <span>Evidence Hash:</span>
                  <span className="text-[#85a8ff]">{step.hash}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Timestamp:</span>
                  <span className="text-zinc-300">{step.timestamp}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.04] flex justify-between items-center">
                  <span className="text-zinc-500">Status:</span>
                  <span className={`font-bold ${step.statusColor}`}>{step.status}</span>
                </div>
                {/* Progress bar */}
                <div className="pt-1">
                  <div className="h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full ${step.barWidth} ${step.barColor} rounded-full`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
