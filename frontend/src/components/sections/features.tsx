import React from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Features() {
  const featureList = [
    {
      title: "Cryptographic Evidence Capture",
      tag: "Capture Layer",
      description:
        "High-definition photo and video ingestion with embedded GPS coordinates, hardware device telemetry, and atomic UTC timestamps to create courtroom-grade records.",
      icon: (
        <svg className="w-6 h-6 text-[#3867FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m10 15 5-3-5-3v6Z" />
        </svg>
      ),
      highlight: "EXIF & Geolocation Verified",
    },
    {
      title: "SHA-256 Tamper-Evident Records",
      tag: "Integrity Layer",
      description:
        "Dual-phase hashing generates independent client-side and server-side digests. Any byte-level alteration, compression artifact, or frame drop invalidates the chain.",
      icon: (
        <svg className="w-6 h-6 text-[#20C997]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      highlight: "Dual-Proof Client & Cloud Digest",
    },
    {
      title: "AI Condition Comparison",
      tag: "Vision Engine",
      description:
        "Multi-angle computer vision compares delivery baseline imagery against return photos. Scratches, cracks, opened seals, and swapped parts are marked with heatmaps.",
      icon: (
        <svg className="w-6 h-6 text-[#3867FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20" />
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M12 2v20" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m4.93 19.07 4.24-4.24" />
        </svg>
      ),
      highlight: "Sub-Millimeter Defect Detection",
    },
    {
      title: "Serial & Barcode OCR Verification",
      tag: "Identity Layer",
      description:
        "Instant optical character recognition automatically reads serial numbers, IMEI tags, UPC barcodes, and manufacturer holograms, stopping 'box-swap' fraud.",
      icon: (
        <svg className="w-6 h-6 text-[#20C997]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="7" y1="8" x2="7" y2="16" />
          <line x1="10" y1="8" x2="10" y2="16" />
          <line x1="14" y1="8" x2="14" y2="16" />
          <line x1="17" y1="8" x2="17" y2="16" />
        </svg>
      ),
      highlight: "Automatic IMEI & Serial Matching",
    },
    {
      title: "Audit-Ready Dispute Reports",
      tag: "Resolution Layer",
      description:
        "Generate one-click PDF dispute packages complete with timestamps, side-by-side photographic diffs, checksums, and carrier manifests accepted by major payment networks.",
      icon: (
        <svg className="w-6 h-6 text-[#3867FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      highlight: "Stripe, Shopify & Visa Pre-Formatted",
    },
    {
      title: "Immutable Chain-of-Custody Ledger",
      tag: "Governance Layer",
      description:
        "Every event — from carrier scan to buyer unboxing to return warehouse intake — is logged to an append-only cryptographic event sequence preventing retroactive edits.",
      icon: (
        <svg className="w-6 h-6 text-[#20C997]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      highlight: "Append-Only Audit Timeline",
    },
  ];

  return (
    <section id="features" className="w-full py-24 sm:py-32 relative bg-[#08080a]">
      <div className="site-container">
        <SectionHeading
          badge="Platform Capabilities"
          badgeVariant="primary"
          title="Engineered for Complete Evidence Integrity."
          serifHighlight="Evidence Integrity."
          subtitle="Every layer of the ReturnProof architecture is designed to eliminate fraud, preserve truth, and accelerate fair resolutions."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featureList.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex flex-col justify-between bg-[#121215] border-white/[0.08] hover:border-white/20"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <Badge variant="outline" size="sm" className="font-mono text-[10px] text-zinc-400">
                    {item.tag}
                  </Badge>
                </div>

                <CardTitle className="text-xl font-semibold text-white">
                  {item.title}
                </CardTitle>

                <CardDescription className="text-sm text-zinc-400 leading-relaxed mt-2.5">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="p-2.5 rounded-lg bg-[#0a0a0c] border border-white/[0.04] flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Standard:</span>
                  <span className="text-xs font-mono text-[#20C997] font-medium">
                    {item.highlight}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
