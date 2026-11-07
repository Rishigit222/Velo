import React from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      badge: "Merchant Dispatch",
      title: "Delivery Handover & Sealing",
      description:
        "The merchant records packaging condition, box barcode, and tamper-evident security seal. A client-side SHA-256 digest is generated and locked to the order ledger before carrier pickup.",
      icon: (
        <svg className="w-6 h-6 text-[#3867FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      tags: ["Serialized Baseline", "Tamper Tape Seal", "Carrier Handover"],
      mockData: {
        hash: "e892c4...71b2",
        status: "SEAL_VERIFIED",
        timestamp: "Dec 14, 10:22:04 UTC",
      },
    },
    {
      number: "02",
      badge: "Customer Receipt",
      title: "AI-Assisted Unboxing Capture",
      description:
        "The buyer launches the ReturnProof web or mobile session to record unboxing. Guided AI prompts ensure box seals, shipping labels, serial numbers, and accessories are clearly captured.",
      icon: (
        <svg className="w-6 h-6 text-[#20C997]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
      tags: ["Guided 360° Capture", "Serial Number OCR", "GPS & UTC Timestamp"],
      mockData: {
        hash: "a492f1...c890",
        status: "UNBOX_CERTIFIED",
        timestamp: "Dec 18, 14:32:09 UTC",
      },
    },
    {
      number: "03",
      badge: "Return Logistics",
      title: "Verified Return & Handover",
      description:
        "If a return is initiated, return intake evidence is automatically compared with the dispatch baseline. Discrepancies, wear patterns, or missing items are highlighted with an audit report.",
      icon: (
        <svg className="w-6 h-6 text-[#5b85ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
          <polyline points="18 8 22 12 18 16" />
          <line x1="6" y1="12" x2="22" y2="12" />
        </svg>
      ),
      tags: ["Automated Diff Engine", "Missing Part Detection", "Instant Resolution"],
      mockData: {
        hash: "b773a9...994e",
        status: "DIFF_RESOLVED",
        timestamp: "Dec 22, 16:45:12 UTC",
      },
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32 relative bg-[#0a0a0d]">
      <div className="site-container">
        <SectionHeading
          badge="Three-Step Protocol"
          badgeVariant="primary"
          title="From Dispatch to Return. Every Moment Has Proof."
          serifHighlight="Every Moment Has Proof."
          subtitle="A continuous cryptographic audit trail linking seller dispatch, buyer unboxing, and return logistics in one tamper-evident record."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step) => (
            <Card
              key={step.number}
              interactive
              className="flex flex-col justify-between group hover:border-[#3867FF]/40 bg-[#121215]"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <span className="font-mono text-3xl font-extrabold text-white/[0.15] group-hover:text-[#3867FF]/30 transition-colors">
                    {step.number}
                  </span>
                </div>

                <div className="mb-2">
                  <Badge variant="outline" size="sm" className="text-zinc-400">
                    {step.badge}
                  </Badge>
                </div>

                <CardTitle className="text-xl lg:text-2xl font-semibold text-white group-hover:text-zinc-100">
                  {step.title}
                </CardTitle>

                <CardDescription className="text-sm text-zinc-400 leading-relaxed mt-2">
                  {step.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Visual Data Pill */}
                <div className="p-3.5 rounded-xl bg-[#09090b] border border-white/[0.06] font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Evidence Hash:</span>
                    <span className="text-[#85a8ff]">{step.mockData.hash}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Timestamp:</span>
                    <span className="text-zinc-300">{step.mockData.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-[#20C997] font-semibold">
                      {step.mockData.status}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
