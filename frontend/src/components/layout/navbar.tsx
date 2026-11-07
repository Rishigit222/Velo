"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Verification Engine", href: "#verification-engine" },
    { name: "Security & Trust", href: "#security" },
    { name: "Workflows", href: "#workflows" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3 bg-[#080808]/85 backdrop-blur-xl border-b border-white/[0.08]" : "py-5 bg-transparent"
      }`}
    >
      <div className="site-header-container flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#3867FF] to-[#20C997] p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(56,103,255,0.4)]">
            <div className="w-full h-full bg-[#0c0c0e] rounded-[10px] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white transition-colors group-hover:text-[#527bff]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                ReturnProof
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide hidden sm:inline-block">
              Chain-of-Custody Protocol
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 px-4 py-1.5 rounded-full glass-nav shadow-lg shadow-black/20">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-full transition-colors hover:bg-white/[0.06]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Real-time Health Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20C997] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20C997]"></span>
            </span>
            <span className="text-xs font-mono text-zinc-300">API: Active</span>
          </div>

          <Link href="#verification-engine">
            <Button variant="secondary" size="sm" className="hidden md:inline-flex">
              Explore Engine
            </Button>
          </Link>

          <Link href="#cta">
            <Button variant="primary" size="sm" className="font-semibold shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="#cta">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
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

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-4 pb-6 mt-3 bg-[#0d0d10] border-b border-white/10 flex flex-col space-y-3 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-base font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
            <Link href="#verification-engine" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Interactive Engine
              </Button>
            </Link>
            <Link href="#cta" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
