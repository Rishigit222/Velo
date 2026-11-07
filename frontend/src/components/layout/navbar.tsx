"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Do not render marketing navbar inside dashboard routes
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const navLinks = [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Verification", href: "/#verification-engine" },
    { label: "Security", href: "/#security" },
    { label: "API Docs", href: "http://localhost:8000/docs" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0C]/85 backdrop-blur-xl border-b border-white/[0.08]"
          : "bg-transparent"
      }`}
    >
      <div className="pw-header flex items-center justify-between h-16">

        {/* ── LEFT: Logo ── */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#1E1E22] border border-white/[0.12] flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:border-white/25">
            <svg className="w-4 h-4 text-[#E5E5E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white tracking-tight leading-none">
              ReturnProof
            </div>
            <div className="text-[10px] text-[#777777] tracking-wider mt-0.5 font-medium hidden sm:block">
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
              className="px-3.5 py-1.5 text-sm font-medium text-[#A3A3A3] hover:text-white rounded-lg transition-colors hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── RIGHT: Status + Actions ── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live status indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#141416] border border-white/[0.08] text-xs font-mono text-[#A3A3A3]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative rounded-full h-1.5 w-1.5 bg-[#49B99A]" />
            </span>
            API Online
          </div>

          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="font-medium gap-2">
                <span>Dashboard</span>
                {user?.role && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/30 border border-black/20 text-[#0a0a0a]">
                    {user.role}
                  </span>
                )}
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-[#A3A3A3] hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-white/[0.05]"
            aria-label="Toggle navigation menu"
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
        <div className="lg:hidden border-t border-white/[0.08] bg-[#0E0E10] px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-[#A3A3A3] hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.08] flex gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">Log in</Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
