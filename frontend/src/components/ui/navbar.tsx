"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X, ExternalLink, ArrowRight } from "lucide-react";
import { healthService } from "@/services/healthService";
import { Badge } from "./badge";
import { Button } from "./button";

export function Navbar() {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    healthService
      .checkHealth()
      .then((res) => {
        if (mounted && res && res.status === "healthy") {
          setBackendStatus("online");
        } else if (mounted) {
          setBackendStatus("offline");
        }
      })
      .catch(() => {
        if (mounted) {
          setBackendStatus("offline");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Verification", href: "#verification" },
    { name: "Tech Stack", href: "#tech-stack" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Return<span className="text-blue-600">Proof</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Chain of Custody AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>API Docs</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Live Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-xs text-slate-600 border border-slate-200/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Backend:</span>
            {backendStatus === "checking" ? (
              <span className="text-slate-500">Checking...</span>
            ) : backendStatus === "online" ? (
              <span className="font-semibold text-emerald-700">Online (v1)</span>
            ) : (
              <span className="font-semibold text-rose-600">Offline</span>
            )}
          </div>

          <a href="#get-started">
            <Button size="sm" variant="primary">
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </a>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
              >
                {link.name}
              </a>
            ))}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 text-base font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              <span>FastAPI Swagger Docs</span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-600">
              <span className="font-medium">Backend Health:</span>
              <Badge variant={backendStatus === "online" ? "success" : "warning"}>
                {backendStatus === "online" ? "Online (v1)" : backendStatus}
              </Badge>
            </div>
            <a href="#get-started" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center" variant="primary">
                Get Started Free
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
