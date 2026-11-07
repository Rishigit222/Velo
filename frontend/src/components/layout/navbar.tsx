"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Verification", href: "#verification-engine" },
    { label: "Security", href: "#security" },
    { label: "API Docs", href: "http://localhost:8000/docs" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#060608]/90 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <div className="pw-header flex items-center justify-between h-16">

        {/* ── LEFT: Logo ── */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #3867FF 0%, #20C997 100%)",
              boxShadow: "0 0 18px rgba(56,103,255,0.5)",
            }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight leading-none">
              ReturnProof
            </div>
            <div className="text-[10px] text-zinc-500 tracking-wide mt-0.5 font-medium hidden sm:block">
              Chain-of-Custody Protocol
            </div>
          </div>
        </Link>

        {/* ── CENTER: Nav Links ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-lg transition-colors hover:bg-white/[0.05]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── RIGHT: Status + Actions ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live status indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs font-mono text-zinc-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-[#20C997] opacity-75" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-[#20C997]" />
            </span>
            API Online
          </div>

          <Link href="#cta" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-zinc-300">
              Log in
            </Button>
          </Link>

          <Link href="#cta">
            <Button
              variant="primary"
              size="sm"
              className="font-semibold shadow-[0_0_20px_rgba(56,103,255,0.4)]"
            >
              Get Started
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.05]"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.07] bg-[#080808] px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-zinc-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.07] flex gap-2">
            <Link href="#cta" className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">Log in</Button>
            </Link>
            <Link href="#cta" className="flex-1" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
