import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserRoles() {
  const buyerFeatures = [
    "60-second guided unboxing capture via secure web link — no app required",
    "Cryptographic certificate of delivered package condition",
    "Clear proof if carrier delivers damaged or empty packaging",
    "72-hour faster refund approval from participating merchants",
    "Privacy-first: encrypted media, no third-party data sharing",
  ];

  const merchantFeatures = [
    "Dispatch serialization and tamper-seal baseline before carrier pickup",
    "Stop fraudulent box swaps, wardrobing, and missing accessory claims",
    "Automated AI visual diff highlights discrepancies in under 10 seconds",
    "One-click dispute packages formatted for Stripe, PayPal, and Shopify",
    "Shopify app, WooCommerce plugin, and REST API available out of the box",
  ];

  return (
    <section id="workflows" className="w-full py-24 sm:py-32 bg-[#09090b] border-t border-white/[0.05]">
      <div className="pw">

        {/* ── Header ── */}
        <div className="mb-14">
          <div className="eyebrow mb-5">Two-Sided Protection</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08] max-w-2xl">
              Tailored for{" "}
              <span className="serif-accent gradient-text-blue">
                Both Sides of the Transaction.
              </span>
            </h2>
            <p className="text-base xl:text-lg text-zinc-400 leading-relaxed max-w-sm text-left lg:text-right pb-1">
              Buyers get rapid refunds for genuine issues. Merchants protect inventory and margins against fraud.
            </p>
          </div>
        </div>

        {/* ── Two wide panels side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Customer Panel */}
          <div className="bg-[#111115] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#20C997]/30 transition-colors duration-300">
            {/* Top accent */}
            <div className="h-0.5 bg-gradient-to-r from-[#20C997]/60 via-[#20C997]/30 to-transparent" />

            <div className="p-8 xl:p-10 flex flex-col h-full">
              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow eyebrow-green">Customer Experience</span>
                <span className="text-xs font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.07] px-2 py-1 rounded-lg">
                  Self-Service Mobile
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-4">
                Protected Deliveries.
                <br />
                Zero Doubt.
              </h3>

              <p className="text-[15px] xl:text-base text-zinc-400 leading-relaxed mb-8">
                Record your unboxing in under 60 seconds with guided AI prompts.
                Never worry about being blamed for transit damage, broken seals,
                or missing contents you never received.
              </p>

              {/* Feature list */}
              <ul className="space-y-3.5 flex-1">
                {buyerFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm xl:text-[15px] text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#20C997]/12 border border-[#20C997]/25 flex items-center justify-center text-[#20C997] text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-500">
                  Included free on all ReturnProof merchant orders.
                </span>
                <Link href="#verification-engine">
                  <Button variant="secondary" size="sm">
                    View Demo →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Merchant Panel */}
          <div className="bg-[#111115] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#3867FF]/40 transition-colors duration-300">
            {/* Top accent */}
            <div className="h-0.5 bg-gradient-to-r from-[#3867FF]/60 via-[#3867FF]/30 to-transparent" />

            <div className="p-8 xl:p-10 flex flex-col h-full">
              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow">Merchant Operations</span>
                <span className="text-xs font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.07] px-2 py-1 rounded-lg">
                  Warehouse & Logistics
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-4">
                Shield Revenue.
                <br />
                Defeat Return Abuse.
              </h3>

              <p className="text-[15px] xl:text-base text-zinc-400 leading-relaxed mb-8">
                Eliminate the \$100B return fraud problem. Verify serialized identities,
                compare dispatch against return state, and generate court-ready dispute
                packages automatically — without touching a keyboard.
              </p>

              {/* Feature list */}
              <ul className="space-y-3.5 flex-1">
                {merchantFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm xl:text-[15px] text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#3867FF]/12 border border-[#3867FF]/25 flex items-center justify-center text-[#6c91ff] text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-500">
                  API, Webhook & Shopify App ready.
                </span>
                <Link href="#cta">
                  <Button variant="primary" size="sm">
                    Start Merchant Pilot
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
