import React from "react";

const securityCards = [
  {
    title: "Client & Server SHA-256 Hashing",
    desc: "Every evidence asset is hashed inside the client sandbox before transmission, then recomputed upon ingest. Any byte-level alteration halts the chain.",
    tag: "Integrity",
  },
  {
    title: "Hash-Linked Audit Events",
    desc: "Every custody handover and condition check is committed to an append-only sequence. Historical records cannot be rewritten or modified.",
    tag: "Traceability",
  },
  {
    title: "Atomic Server Timestamps",
    desc: "Timestamps are notarized against global atomic Stratum-1 servers. Local device clock rollbacks and manipulated metadata are detected and rejected.",
    tag: "Notarization",
  },
  {
    title: "Access-Controlled Storage",
    desc: "Media is encrypted at rest using AES-256. Time-limited pre-signed access tokens restrict inspection to verified parties only.",
    tag: "Confidentiality",
  },
];

export function SecurityTrust() {
  return (
    <section id="security" className="w-full py-24 sm:py-32 bg-[#080808] relative">
      <div className="pw">

        {/* ── SPLIT LAYOUT: Left headline, Right 2×2 grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[48fr_52fr] gap-12 xl:gap-20 items-start">

          {/* LEFT: Large headline + supporting text */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="eyebrow mb-5">Security Architecture</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Evidence You Can Trace.
                <br />
                <span className="serif-accent silver-gradient-text">
                  Records You Can Verify.
                </span>
              </h2>
            </div>

            <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed">
              Built to the rigorous evidentiary standards demanded by payment
              processors, insurance underwriters, and dispute arbitration panels.
              Velo applies cryptographic verification at every layer.
            </p>

            {/* Additional security pillars */}
            <div className="space-y-4 pt-2">
              {[
                {
                  title: "Zero-Knowledge Dispute Tokens",
                  desc: "Shareable, read-only verification tokens formatted for Stripe, Shopify, and card networks without exposing customer PII.",
                },
                {
                  title: "Role-Based Permission Scopes",
                  desc: "Strict access boundaries isolate Buyer, Seller, and Inspector capabilities, enforced at the API database level.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl card-charcoal"
                >
                  <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                  <div className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Trust badges row */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {["AES-256 Storage", "Stratum-1 Atomic NTP", "RBAC Enforced", "Append-Only Ledger"].map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/[0.08] bg-[#141414] text-[#A3A3A3]"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: 2×2 security card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {securityCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col card-charcoal rounded-2xl p-6 group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider border border-white/[0.08] px-2.5 py-0.5 rounded-full bg-white/[0.02]">
                    {card.tag}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A]" />
                </div>

                <h3 className="text-base font-semibold text-white leading-snug mb-2.5">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed flex-1">
                  {card.desc}
                </p>

                <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-1.5 text-xs text-[#49B99A] font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Verified Active
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
