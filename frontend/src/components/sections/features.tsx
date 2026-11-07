import React from "react";

const featureCards = [
  {
    tag: "Capture Layer",
    title: "Cryptographic Evidence Capture",
    desc: "High-definition photo and video ingestion with embedded GPS, hardware telemetry, and atomic UTC timestamps to create courtroom-grade records.",
    highlight: "EXIF & Geolocation Verified",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    tag: "Integrity Layer",
    title: "SHA-256 Tamper-Evident Records",
    desc: "Dual-phase hashing: client-side digest generated before upload, server recomputed on ingest. Any byte alteration or compression artifact breaks the chain.",
    highlight: "Client & Cloud Digest Match",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    tag: "Governance Layer",
    title: "Immutable Chain-of-Custody Ledger",
    desc: "Every event — scan, inspection, dispute, review — is logged to an append-only cryptographic sequence. No retroactive edits by any user or administrator.",
    highlight: "Append-Only Audit Timeline",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    tag: "Vision Engine",
    title: "Condition Verification Engine",
    desc: "Visual comparison cross-references delivery baseline against return photos. Scratches, opened seals, swapped components, and packaging damage are mapped with precision.",
    highlight: "Defect Mapping & Analysis",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    tag: "Identity Layer",
    title: "Serial & Barcode OCR Verification",
    desc: "Instant optical recognition reads serial numbers, IMEI tags, UPC barcodes, and manufacturer holograms automatically — stopping box-swap fraud cold.",
    highlight: "Automatic Hardware Matching",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="8" x2="7" y2="16" />
        <line x1="10" y1="8" x2="10" y2="16" />
        <line x1="14" y1="8" x2="14" y2="16" />
        <line x1="17" y1="8" x2="17" y2="16" />
      </svg>
    ),
  },
  {
    tag: "Resolution Layer",
    title: "Audit-Ready Dispute Reports",
    desc: "One-click PDF packages with timestamps, side-by-side photographic diffs, checksums, and carrier manifests — formatted for Stripe, Shopify, and card networks.",
    highlight: "Stripe & Visa Dispute Format",
    icon: (
      <svg className="w-5 h-5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="w-full py-24 sm:py-32 bg-[#080808] relative">
      <div className="pw">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <div className="eyebrow mb-5">Platform Capabilities</div>
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08] max-w-2xl">
              Engineered for Complete{" "}
              <span className="serif-accent silver-gradient-text">Evidence Integrity.</span>
            </h2>
          </div>
          <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed max-w-sm text-left lg:text-right pb-1">
            Every layer is designed to eliminate fraud, preserve truth, and accelerate fair resolutions.
          </p>
        </div>

        {/* ── Full-width 3×2 card grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col card-charcoal rounded-2xl p-7 sm:p-8 group"
            >
              {/* Icon + tag */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#222222] border border-white/[0.08] flex items-center justify-center transition-colors group-hover:border-white/20">
                  {card.icon}
                </div>
                <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider border border-white/[0.07] px-2.5 py-1 rounded-full bg-white/[0.02]">
                  {card.tag}
                </span>
              </div>

              {/* Text */}
              <h3 className="text-lg xl:text-xl font-semibold text-white leading-snug mb-3">
                {card.title}
              </h3>
              <p className="text-sm xl:text-[15px] text-[#A3A3A3] leading-relaxed flex-1">
                {card.desc}
              </p>

              {/* Bottom highlight bar */}
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-[#777777]">Standard:</span>
                <span className="text-xs font-medium text-[#D4D4D4]">
                  {card.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
