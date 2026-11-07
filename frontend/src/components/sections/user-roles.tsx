import React from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function UserRoles() {
  const buyerFeatures = [
    "Zero-app mobile unboxing capture via secure web link",
    "Instant cryptographic certificate of delivered package condition",
    "Clear, undeniable proof if carrier delivers damaged or empty box",
    "72-hour faster refund approval from participating merchants",
    "Privacy-first media handling with encrypted access",
  ];

  const merchantFeatures = [
    "Pre-dispatch serialization and tamper-seal baseline creation",
    "Stop fraudulent box swaps, wardrobing, and missing accessory claims",
    "Automated AI visual comparison highlights defects in seconds",
    "One-click dispute evidence bundles formatted for Stripe and PayPal",
    "Integrates seamlessly with Shopify, WooCommerce, and custom ERPs",
  ];

  return (
    <section id="workflows" className="w-full py-24 sm:py-32 relative bg-[#09090b]">
      <div className="site-container">
        <SectionHeading
          badge="Two-Sided Protection"
          badgeVariant="primary"
          title="Tailored for Both Sides of the Transaction."
          serifHighlight="Both Sides of the Transaction."
          subtitle="ReturnProof creates mutual trust. Buyers get rapid refunds for genuine issues; merchants protect inventory and profit margins against fraud."
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: For Buyers */}
          <Card className="flex flex-col justify-between bg-[#111114] border-white/[0.08] hover:border-[#20C997]/30 transition-all p-2 sm:p-4">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="success" size="sm" className="font-mono">
                  CUSTOMER EXPERIENCE
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">
                  Self-Service Mobile Flow
                </span>
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                Protected Deliveries. Zero Doubt.
              </CardTitle>

              <CardDescription className="text-zinc-400 leading-relaxed mt-2 text-base">
                Record your unboxing in under 60 seconds with guided AI prompts.
                Never worry about getting blamed for transit damage, broken seals,
                or missing contents.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {buyerFeatures.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#20C997]/15 text-[#20C997] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  Included free on all ReturnProof merchant orders.
                </span>
                <Link href="#verification-engine">
                  <Button variant="secondary" size="sm">
                    View Demo Unbox
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: For Merchants */}
          <Card className="flex flex-col justify-between bg-[#111114] border-white/[0.08] hover:border-[#3867FF]/40 transition-all p-2 sm:p-4">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="primary" size="sm" className="font-mono">
                  MERCHANT OPERATIONS
                </Badge>
                <span className="text-xs text-zinc-400 font-mono">
                  Warehouse & Logistics Suite
                </span>
              </div>

              <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                Shield Revenue. Defeat Return Abuse.
              </CardTitle>

              <CardDescription className="text-zinc-400 leading-relaxed mt-2 text-base">
                Eliminate the $100B return fraud problem. Verify serialized
                identities, compare dispatch against return state, and generate
                court-ready dispute packages automatically.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {merchantFeatures.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="w-5 h-5 rounded-full bg-[#3867FF]/15 text-[#6c91ff] flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  API, Webhook & Shopify App ready.
                </span>
                <Link href="#cta">
                  <Button variant="primary" size="sm">
                    Start Merchant Pilot
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
