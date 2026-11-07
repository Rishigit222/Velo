import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UserRoles() {
  const buyerFeatures = [
    "60-second guided unboxing verification via web link — no app install needed",
    "Instant cryptographic certificate of delivered package condition",
    "Undeniable proof if delivery arrives damaged or packaging was tampered",
    "Accelerated refund authorizations from participating brand merchants",
    "Privacy-first architecture with access-controlled media encryption",
  ];

  const merchantFeatures = [
    "Pre-dispatch serialization and tamper seal record before carrier pickup",
    "Defend against fraudulent box swaps, empty-box claims, and wardrobing",
    "Automated condition diffing surfaces discrepancies in under 10 seconds",
    "Standardized PDF dispute packages formatted for Stripe, PayPal, and Shopify",
    "REST API, Webhooks, and e-commerce platform connectors ready out of the box",
  ];

  return (
    <section id="workflows" className="w-full py-24 sm:py-32 bg-[#0B0B0B] border-t border-white/[0.06] relative">
      <div className="pw">

        {/* ── Header ── */}
        <div className="mb-14">
          <div className="eyebrow mb-5">Two-Sided Protection</div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.08] max-w-2xl">
              Tailored for{" "}
              <span className="serif-accent silver-gradient-text">
                Both Sides of the Transaction.
              </span>
            </h2>
            <p className="text-base xl:text-lg text-[#A3A3A3] leading-relaxed max-w-sm text-left lg:text-right pb-1">
              Buyers receive rapid refunds for genuine issues. Merchants protect inventory and margins against abuse.
            </p>
          </div>
        </div>

        {/* ── Two wide panels side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Customer Panel */}
          <div className="card-charcoal rounded-2xl overflow-hidden group">
            <div className="p-8 sm:p-10 flex flex-col h-full">
              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow">Customer Experience</span>
                <span className="text-xs font-mono text-[#777777] bg-[#141414] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                  Self-Service Web Flow
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-4">
                Protected Deliveries.
                <br />
                Zero Doubt.
              </h3>

              <p className="text-[15px] xl:text-base text-[#A3A3A3] leading-relaxed mb-8">
                Record package condition upon delivery in under 60 seconds.
                Never worry about being held accountable for transit damage,
                broken factory seals, or missing accessories.
              </p>

              {/* Feature list */}
              <ul className="space-y-3.5 flex-1">
                {buyerFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm xl:text-[15px] text-[#A3A3A3]">
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <span className="text-xs text-[#777777]">
                  Included free on ReturnProof orders.
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
          <div className="card-charcoal rounded-2xl overflow-hidden group">
            <div className="p-8 sm:p-10 flex flex-col h-full">
              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow">Merchant Operations</span>
                <span className="text-xs font-mono text-[#777777] bg-[#141414] border border-white/[0.07] px-2.5 py-1 rounded-lg">
                  Warehouse & Fulfillment
                </span>
              </div>

              {/* Headline */}
              <h3 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-4">
                Shield Revenue.
                <br />
                Defeat Return Abuse.
              </h3>

              <p className="text-[15px] xl:text-base text-[#A3A3A3] leading-relaxed mb-8">
                Eliminate the multi-billion dollar return fraud problem. Verify serialized
                identities, compare dispatch against return state, and generate court-ready
                dispute packages automatically.
              </p>

              {/* Feature list */}
              <ul className="space-y-3.5 flex-1">
                {merchantFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm xl:text-[15px] text-[#A3A3A3]">
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <span className="text-xs text-[#777777]">
                  REST API & Shopify app available.
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
