import React from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SecurityTrust() {
  const securityPillars = [
    {
      title: "Dual Client & Server Hashing",
      category: "Integrity",
      description:
        "Every photo and video is hashed with SHA-256 inside the browser sandbox before transmission, then re-computed upon backend ingestion. Bit-level mismatches immediately halt the session.",
      badge: "Zero-Tamper Guarantee",
    },
    {
      title: "Immutable Audit Ledger",
      category: "Traceability",
      description:
        "Every event — capture, inspection, dispute filing, and admin review — is recorded as an immutable hash-linked entry. No user, seller, or administrator can edit historical records.",
      badge: "Cryptographic Chain",
    },
    {
      title: "Atomic UTC Timestamps",
      category: "Notarization",
      description:
        "Timestamps are notarized against global Stratum-1 atomic clocks. Device clock rollbacks and manual EXIF tampering are automatically flagged and rejected.",
      badge: "NTP Synchronized",
    },
    {
      title: "AES-256 Encrypted Storage",
      category: "Confidentiality",
      description:
        "All customer videos and unboxing imagery are encrypted at rest using AES-256 GCM. Temporary pre-signed tokens prevent unauthorized public indexing or hotlinking.",
      badge: "Encrypted at Rest",
    },
    {
      title: "Zero-Knowledge Dispute Tokens",
      category: "Interoperability",
      description:
        "Generate cryptographic, read-only dispute URLs formatted for Shopify, Amazon, Stripe, and Visa dispute portals without exposing sensitive personal customer data.",
      badge: "Dispute Compatible",
    },
    {
      title: "Strict Role-Based Access Control",
      category: "Governance",
      description:
        "Granular permission separation isolates Buyer, Seller, and System Inspector scopes. Even within multi-tenant organizations, access is constrained to assigned order IDs.",
      badge: "RBAC Enforced",
    },
  ];

  return (
    <section id="security" className="w-full py-24 sm:py-32 relative bg-[#070709]">
      <div className="site-container">
        <SectionHeading
          badge="Enterprise Security"
          badgeVariant="primary"
          title="Evidence You Can Trust. Records You Can Prove."
          serifHighlight="Records You Can Prove."
          subtitle="Built to the rigorous evidentiary standards demanded by payment processors, insurance underwriters, and legal arbitrations."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {securityPillars.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex flex-col justify-between bg-[#111114] border-white/[0.08] hover:border-white/20"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase text-zinc-400">
                    {item.category}
                  </span>
                  <Badge variant="outline" size="sm" className="text-zinc-300 font-mono text-[10px]">
                    {item.badge}
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
                <div className="flex items-center gap-2 text-xs font-mono text-[#20C997]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>Verification Enforced</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
