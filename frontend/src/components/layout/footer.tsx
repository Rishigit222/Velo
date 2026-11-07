import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#060608] border-t border-white/[0.06] text-[#A3A3A3]">
      <div className="pw py-16 xl:py-20">

        {/* Four-column distributed layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div className="w-8 h-8 rounded-lg bg-[#1E1E22] border border-white/[0.12] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">ReturnProof</span>
            </Link>

            <p className="text-sm text-[#777777] leading-relaxed">
              AI-assisted digital chain-of-custody platform for e-commerce deliveries and returns. Cryptographically verifiable evidence from dispatch to resolution.
            </p>

            {/* System status */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#777777]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative rounded-full h-1.5 w-1.5 bg-[#49B99A]" />
              </span>
              All Systems Operational
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Platform</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "Delivery Handover", href: "#how-it-works" },
                { label: "Unboxing Verification", href: "#how-it-works" },
                { label: "Condition Comparison", href: "#verification-engine" },
                { label: "SHA-256 Tamper Records", href: "#features" },
                { label: "Dispute Evidence Packages", href: "#features" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#A3A3A3] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Security */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Security</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "Client-Server Hashing", href: "#security" },
                { label: "Immutable Audit Ledger", href: "#security" },
                { label: "AES-256 Media Storage", href: "#security" },
                { label: "Stratum-1 Atomic NTP", href: "#security" },
                { label: "Role-Based Access Control", href: "#security" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[#A3A3A3] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Developers */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest">Developers</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "FastAPI Swagger Docs", href: "http://localhost:8000/docs", external: true },
                { label: "ReDoc API Reference", href: "http://localhost:8000/redoc", external: true },
                { label: "Evidence Webhooks", href: "#features" },
                { label: "Client SDK Reference", href: "#workflows" },
                { label: "Developer Sandbox Key", href: "#cta" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noreferrer" : undefined}
                    className="text-[#A3A3A3] hover:text-white transition-colors"
                  >
                    {l.label}
                    {l.external && (
                      <span className="ml-1 text-[10px] text-[#777777]">↗</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-7 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <span>© 2026 ReturnProof Inc. All rights reserved. Cryptographic chain-of-custody platform.</span>
          <div className="flex items-center gap-6">
            <Link href="#security" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#security" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#security" className="hover:text-white transition-colors">Security Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
