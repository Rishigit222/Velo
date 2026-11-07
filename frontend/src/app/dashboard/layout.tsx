"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, isSeller, isAdmin, isBuyer } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If loading, show clean loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
            Authenticating Session...
          </span>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to login
  if (!isAuthenticated || !user) {
    if (typeof window !== "undefined") {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-sm text-[#777777]">
        Redirecting to login...
      </div>
    );
  }

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      active: pathname === "/dashboard",
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      active: pathname.startsWith("/dashboard/orders"),
    },
    {
      label: isSeller ? "My Products" : isAdmin ? "Product Catalog" : "Browse Catalog",
      href: "/dashboard/products",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      active: pathname.startsWith("/dashboard/products"),
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] flex flex-col lg:flex-row">
      {/* ═══════════════════════════════════════
          DESKTOP SIDEBAR
      ═══════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0E0E10] border-r border-white/[0.08] shrink-0 sticky top-0 h-screen">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1E1E22] border border-white/[0.12] flex items-center justify-center transition-colors group-hover:border-white/25">
              <svg className="w-3.5 h-3.5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">ReturnProof</span>
          </Link>

          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#D4D4D4]">
            {user.role}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono text-[#777777] uppercase tracking-wider">
            Platform Navigation
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                item.active
                  ? "bg-[#1E1E22] text-white border border-white/[0.12] shadow-sm"
                  : "text-[#A3A3A3] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className={item.active ? "text-white" : "text-[#777777]"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-6 px-3 pb-2 text-[10px] font-mono text-[#777777] uppercase tracking-wider">
            Quick Links
          </div>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#A3A3A3] hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <span>FastAPI Docs</span>
            <span className="text-[10px] text-[#777777]">↗</span>
          </a>
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#A3A3A3] hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <span>Landing Page</span>
            <span className="text-[10px] text-[#777777]">↗</span>
          </Link>
        </nav>

        {/* User Profile & Logout Bottom Box */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0A0C]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#1C1C1F] border border-white/[0.1] flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-white truncate">
                  {user.full_name || "User"}
                </div>
                <div className="text-[11px] text-[#777777] truncate font-mono">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#141416] hover:bg-[#1A1A1E] border border-white/[0.08] text-xs font-medium text-[#A3A3A3] hover:text-rose-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          MOBILE TOPBAR
      ═══════════════════════════════════════ */}
      <div className="lg:hidden h-16 px-4 bg-[#0E0E10] border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1E1E22] border border-white/[0.12] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#E5E5E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-white">ReturnProof</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-[#D4D4D4]">
            {user.role}
          </span>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-white/[0.06] text-[#A3A3A3] hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden bg-[#0A0A0C] border-b border-white/[0.08] p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                item.active ? "bg-[#1E1E22] text-white" : "text-[#A3A3A3]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-3 text-xs text-rose-300 hover:underline"
          >
            Sign Out ({user.email})
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MAIN CONTENT VIEWPORT
      ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <header className="h-16 px-6 sm:px-8 border-b border-white/[0.07] bg-[#0A0A0C]/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#777777] font-mono hidden sm:inline">WORKSPACE /</span>
            <span className="text-sm font-semibold text-white">
              {isBuyer ? "Buyer Console" : isSeller ? "Merchant Operations" : "Administrator Hub"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#A3A3A3]">
            <span className="hidden sm:inline">Connected:</span>
            <span className="text-[#49B99A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A]" />
              FastAPI v1
            </span>
          </div>
        </header>

        {/* Dashboard Main Viewport */}
        <main className="flex-1 p-6 sm:p-8 xl:p-10 max-w-[1600px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
