import React from "react";
import Link from "next/link";
import { HashBadge } from "@/components/ui/badge";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.08] text-zinc-400 mt-24">
      <div className="site-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-2 flex flex-col space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#3867FF] to-[#20C997] p-[1.5px]">
                <div className="w-full h-full bg-[#0c0c0e] rounded-[9px] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                ReturnProof
              </span>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              The AI-assisted digital chain-of-custody platform for e-commerce
              product delivery, unboxing and returns. Cryptographically verifiable
              evidence from dispatch to final resolution.
            </p>

            <div className="pt-2">
              <HashBadge hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20C997] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20C997]"></span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Platform Status: All Systems Operational
              </span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Platform
            </h4>
            <ul className="flex flex-col space-y-2.5 text-sm">
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  Delivery Handover
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  Unboxing Verification
                </Link>
              </li>
              <li>
                <Link href="#verification-engine" className="hover:text-white transition-colors">
                  AI Condition Diff Engine
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Tamper-Evident SHA-256
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Dispute Evidence Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Security & Trust */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Security
            </h4>
            <ul className="flex flex-col space-y-2.5 text-sm">
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  Client-Server Hashing
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  Immutable Audit Ledger
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  AES-256 Media Storage
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  NTP Synchronized Time
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-white transition-colors">
                  Role-Based Access Control
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers & Resources */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-white">
              Developers
            </h4>
            <ul className="flex flex-col space-y-2.5 text-sm">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>FastAPI Swagger Docs</span>
                  <span className="text-[10px] text-zinc-300 bg-white/10 px-1 py-0.2 rounded font-mono">
                    v1
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/redoc"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ReDoc API Reference
                </a>
              </li>
              <li>
                <Link href="#workflows" className="hover:text-white transition-colors">
                  Customer & Merchant SDK
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-white transition-colors">
                  Evidence Ingestion Webhooks
                </Link>
              </li>
              <li>
                <Link href="#cta" className="hover:text-white transition-colors">
                  Developer Sandbox Key
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {currentYear} ReturnProof Inc. All rights reserved. Cryptographic chain-of-custody platform.</p>
          <div className="flex items-center gap-6">
            <Link href="#security" className="hover:text-zinc-200 transition-colors">
              Privacy Protocol
            </Link>
            <Link href="#security" className="hover:text-zinc-200 transition-colors">
              Terms of Custody
            </Link>
            <Link href="#security" className="hover:text-zinc-200 transition-colors">
              Security Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
