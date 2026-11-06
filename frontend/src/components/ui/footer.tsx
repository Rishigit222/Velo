import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Database, Code2, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50/70 text-slate-600">
      <div className="site-container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 xl:gap-14">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Return<span className="text-blue-600">Proof</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              Digital chain-of-custody platform that captures, verifies, and maintains
              immutable product condition evidence across delivery, unboxing, and returns.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                <span>SHA-256 Chained</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200">
                <Database className="h-3.5 w-3.5 text-blue-600" />
                <span>FastAPI + SQLite</span>
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 transition-colors">
                  Feature Suite
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-blue-600 transition-colors">
                  Verification Engine
                </a>
              </li>
              <li>
                <a href="#tech-stack" className="hover:text-blue-600 transition-colors">
                  Technology Stack
                </a>
              </li>
            </ul>
          </div>

          {/* Evidence Pipeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Chain of Custody
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                  Delivery Sealing
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                  Customer Unboxing
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-blue-600 transition-colors">
                  Damage Comparison
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 transition-colors">
                  Dispute Dossiers
                </a>
              </li>
            </ul>
          </div>

          {/* Developers & API */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Developers
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span>FastAPI Swagger</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/api/v1/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span>Health Probe API</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Rishigit222/Velo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 ReturnProof Technologies Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span>Cryptographic Proof Guarantee</span>
            <span>•</span>
            <span>SOC2 Type II Ready</span>
            <span>•</span>
            <span>Privacy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
