import React from "react";

const securityCards = [
  {
    title: "Client & Server SHA-256 Hashing",
    desc: "Every file is hashed inside the browser before upload, then recomputed server-side. Any byte-level mismatch halts the session immediately.",
    icon: "🔐",
    tag: "Integrity",
  },
  {
    title: "Hash-Linked Immutable Audit Events",
    desc: "Every custody event is appended to a hash-linked ledger. Prior records cannot be altered, deleted, or reordered by any user or admin.",
    icon: "🔗",
    tag: "Traceability",
  },
  {
    title: "Atomic NTP Server Timestamps",
    desc: "Timestamps are notarized against Stratum-1 atomic clocks. Device clock rollbacks and EXIF date tampering are detected and rejected automatically.",
    icon: "⏱",
    tag: "Notarization",
  },
  {
    title: "Access-Controlled Evidence Storage",
    desc: "Media is encrypted at rest with AES-256 GCM. Temporary pre-signed tokens restrict access to authorized parties only — no public indexing.",
    icon: "🗄",
    tag: "Confidentiality",
  },
];

export function SecurityTrust() {
  return (
    <section id="security" className="w-full py-24 sm:py-32 bg-[#07070a]">
      <div className="pw">

        {/* ── SPLIT LAYOUT: Left headline, Right 2×2 grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[48fr_52fr] gap-12 xl:gap-20 items-start">

          {/* LEFT: Large headline + supporting text + extra pillars */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="eyebrow mb-5">Enterprise Security</div>
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08]">
                Evidence You Can Trace.
                <br />
                <span className="serif-accent gradient-text-blue">
                  Records You Can Verify.
                </span>
              </h2>
            </div>

            <p className="text-base xl:text-lg text-zinc-400 leading-relaxed">
              Built to the rigorous evidentiary standards demanded by payment
              processors, insurance underwriters, and legal arbitration panels.
              ReturnProof applies cryptographic rigor at every layer of the
              evidence pipeline.
            </p>

            {/* Additional security pillars */}
            <div className="space-y-5 pt-2">
              {[
                {
                  title: "Zero-Knowledge Dispute Tokens",
                  desc: "Generate cryptographic, read-only dispute URLs for Shopify, Stripe, and Visa without exposing personal customer data.",
                },
                {
                  title: "Role-Based Access Control",
                  desc: "Granular permission isolation separates Buyer, Seller, and Inspector scopes — access is constrained to assigned order IDs only.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-[#111115] border border-white/[0.07]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#20C997]/12 border border-[#20C997]/25 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#20C997]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                    <div className="text-sm text-zinc-400 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges row */}
            <div className="flex flex-wrap gap-3 pt-2">
              {["AES-256 Encrypted", "Stratum-1 NTP", "RBAC Enforced", "Append-Only Ledger"].map((badge) => (
                <span
                  key={badge}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-zinc-400"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: 2×2 security card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {securityCards.map((card) => (
              <div
                key={card.title}
                className="flex flex-col bg-[#121216] border border-white/[0.07] rounded-2xl p-6 hover:border-white/[0.18] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider border border-white/[0.07] px-2 py-0.5 rounded-full">
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white leading-snug mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  {card.desc}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-mono text-[#20C997]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  Enforced at Runtime
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
