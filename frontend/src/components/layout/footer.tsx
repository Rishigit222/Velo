import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#040408] border-t border-white/[0.06] text-zinc-400">
      <div className="pw py-16 xl:py-20">

        {/* Four-column distributed layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #3867FF, #20C997)" }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">ReturnProof</span>
            </Link>

            <p className="text-sm text-zinc-500 leading-relaxed">
              AI-assisted digital chain-of-custody platform for e-commerce deliveries and returns. Cryptographically verifiable evidence from dispatch to resolution.
            </p>

            {/* System status */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-[#20C997] opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-[#20C997]" />
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
                { label: "AI Condition Diff", href: "#verification-engine" },
                { label: "SHA-256 Tamper Records", href: "#features" },
                { label: "Dispute Evidence Packages", href: "#features" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-zinc-200 transition-colors">
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
                { label: "NTP Synchronized Time", href: "#security" },
                { label: "Role-Based Access Control", href: "#security" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-zinc-200 transition-colors">
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
                { label: "SDK — Buyer & Merchant", href: "#workflows" },
                { label: "Developer Sandbox", href: "#cta" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={l.external ? "_blank" : undefined}
                    rel={l.external ? "noreferrer" : undefined}
                    className="hover:text-zinc-200 transition-colors"
                  >
                    {l.label}
                    {l.external && (
                      <span className="ml-1 text-[10px] text-zinc-600">↗</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-7 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 ReturnProof Inc. All rights reserved. Cryptographic chain-of-custody platform.</span>
          <div className="flex items-center gap-6">
            <Link href="#security" className="hover:text-zinc-400 transition-colors">Privacy</Link>
            <Link href="#security" className="hover:text-zinc-400 transition-colors">Terms</Link>
            <Link href="#security" className="hover:text-zinc-400 transition-colors">Security Disclosures</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
