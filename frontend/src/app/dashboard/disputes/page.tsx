"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { disputeService } from "@/services/disputeService";
import { orderService } from "@/services/orderService";
import { Dispute, Order, DisputeStatus } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function DisputesPage() {
  const { isBuyer, isSeller } = useAuth();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Record<number, Order>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendPending, setIsBackendPending] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisputeStatus>("all");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        // Check dispute service status
        const statusCheck = await disputeService.checkStatus();
        if (!statusCheck.isAvailable) {
          if (active) {
            setIsBackendPending(true);
          }
        }

        // Fetch disputes
        const [disputesList, ordersList] = await Promise.all([
          disputeService.listDisputes().catch(() => []),
          orderService.list().catch(() => []),
        ]);

        if (!active) return;

        setDisputes(disputesList);

        // Map orders for fast lookup
        const orderMap: Record<number, Order> = {};
        ordersList.forEach((ord) => {
          orderMap[ord.id] = ord;
        });
        setOrders(orderMap);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load dispute records.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Filtered & Searched Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((item) => {
      // Status filter
      if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const relatedOrder = orders[item.order_id];
        const matchId = String(item.id).includes(query);
        const matchOrder = relatedOrder?.order_number?.toLowerCase().includes(query) || String(item.order_id).includes(query);
        const matchReason = item.dispute_reason.toLowerCase().includes(query);
        const matchProduct = relatedOrder?.product?.product_name?.toLowerCase().includes(query);
        return matchId || matchOrder || matchReason || matchProduct;
      }

      return true;
    });
  }, [disputes, statusFilter, searchQuery, orders]);

  // Statistics counters
  const counts = useMemo(() => {
    return {
      all: disputes.length,
      open: disputes.filter((d) => d.status.toLowerCase() === "open").length,
      under_review: disputes.filter((d) => d.status.toLowerCase() === "under_review").length,
      resolved: disputes.filter((d) => d.status.toLowerCase() === "resolved").length,
      rejected: disputes.filter((d) => d.status.toLowerCase() === "rejected").length,
    };
  }, [disputes]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#D4A359]/10 border border-[#D4A359]/25 text-[#D4A359]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]" />
            OPEN
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#3867FF]/10 border border-[#3867FF]/25 text-[#6B90FF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3867FF] animate-pulse" />
            UNDER REVIEW
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#49B99A]/10 border border-[#49B99A]/25 text-[#49B99A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A]" />
            RESOLVED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-rose-500/10 border border-rose-500/25 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/[0.06] border border-white/[0.1] text-[#A3A3A3] uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-[1720px] mx-auto pb-16">
      {/* ═══════════════════════════════════════
          HEADER & ACTIONS
      ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#777777] mb-1.5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              WORKSPACE
            </Link>
            <span>/</span>
            <span className="text-white">DISPUTE ARBITRATION & CLAIMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Dispute Management</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-[#A3A3A3] font-normal">
              {isBuyer ? "Buyer Claims" : isSeller ? "Merchant Defense" : "Global Arbitration"}
            </span>
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1.5 max-w-2xl">
            Cryptographically supported dispute dossiers. Claims are cross-referenced with dispatch condition reports, customer return evidence, and SHA-256 hash chains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/disputes/new">
            <Button className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-5 py-2.5 text-xs font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-[#3867FF]/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>File New Dispute</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BACKEND STEP 7 DEPENDENCY BANNER
      ═══════════════════════════════════════ */}
      {isBackendPending && (
        <div className="card-charcoal rounded-2xl p-5 border border-[#3867FF]/20 bg-[#3867FF]/[0.03] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-[#3867FF]/10 border border-[#3867FF]/20 flex items-center justify-center text-[#6B90FF] shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <span>FastAPI Dispute Arbitration Engine (Step 7 Roadmap)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3867FF]/15 text-[#88A8FF] border border-[#3867FF]/30">
                  SCHEMA READY
                </span>
              </div>
              <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                The database tables (<code className="font-mono text-white/80">disputes</code>) and Pydantic schemas (<code className="font-mono text-white/80">DisputeCreate</code>, <code className="font-mono text-white/80">DisputeResponse</code>) are defined in the backend. Dedicated REST routes (<code className="font-mono text-white/80">/api/v1/disputes</code>) are scheduled for Step 7. All digital chain-of-custody evidence and SHA-256 audit logs are live and accessible for manual inspection.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/verification"
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
          >
            Inspect Evidence Vault →
          </Link>
        </div>
      )}

      {/* Global Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* ═══════════════════════════════════════
          SEARCH & FILTER TOOLBAR
      ═══════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141416] border border-white/[0.08] rounded-xl overflow-x-auto">
          {[
            { id: "all", label: "All Disputes", count: counts.all },
            { id: "open", label: "Open", count: counts.open },
            { id: "under_review", label: "Under Review", count: counts.under_review },
            { id: "resolved", label: "Resolved", count: counts.resolved },
            { id: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as "all" | DisputeStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-2 ${
                statusFilter === tab.id
                  ? "bg-[#1E1E22] text-white shadow-sm border border-white/[0.1]"
                  : "text-[#777777] hover:text-[#D4D4D4]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  statusFilter === tab.id
                    ? "bg-white/[0.1] text-white"
                    : "bg-white/[0.04] text-[#777777]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Dispute ID, Order #, or Reason..."
            className="w-full bg-[#141416] border border-white/[0.08] rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-[#777777] focus:outline-none focus:border-white/25"
          />
          <svg
            className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777777] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DISPUTES DATA TABLE / LIST
      ═══════════════════════════════════════ */}
      {isLoading ? (
        <div className="card-charcoal rounded-2xl p-12 border border-white/[0.08] text-center">
          <div className="inline-flex items-center gap-3 text-sm text-[#A3A3A3] font-mono">
            <svg className="w-5 h-5 animate-spin text-[#3867FF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading authenticated dispute records...
          </div>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="card-charcoal rounded-2xl p-12 sm:p-16 border border-white/[0.08] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1F] border border-white/[0.08] flex items-center justify-center text-[#777777] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {searchQuery || statusFilter !== "all"
              ? "No matching disputes found"
              : "No Active Disputes Recorded"}
          </h3>
          <p className="text-xs text-[#777777] max-w-md mt-1.5 leading-relaxed">
            {searchQuery || statusFilter !== "all"
              ? "Try clearing your search query or selecting a different status filter."
              : isBuyer
              ? "You haven't filed any return disputes. When a merchant disputes a return or an item arrives compromised, evidence dossiers appear here."
              : "All customer return requests and custody handovers have completed with intact condition verifications."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-[#D4D4D4] hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                Clear Filters
              </button>
            )}
            <Link href="/dashboard/disputes/new">
              <Button className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-4 py-2 text-xs rounded-xl">
                Submit New Dispute
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-charcoal rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] border-b border-white/[0.08] text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Dispute ID</th>
                  <th className="px-6 py-4 font-medium">Order & Product</th>
                  <th className="px-6 py-4 font-medium">Dispute Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Lodged Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredDisputes.map((dispute) => {
                  const relatedOrder = orders[dispute.order_id];
                  const formattedDate = new Date(dispute.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={dispute.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Dispute ID */}
                      <td className="px-6 py-4 font-mono font-medium text-white">
                        <Link
                          href={`/dashboard/disputes/${dispute.id}`}
                          className="hover:text-[#6B90FF] transition-colors flex items-center gap-1.5"
                        >
                          <span>#DSP-{dispute.id}</span>
                          <span className="text-[10px] text-[#777777] opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </Link>
                      </td>

                      {/* Order & Product */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {relatedOrder?.order_number || `#ORD-${dispute.order_id}`}
                        </div>
                        <div className="text-[11px] text-[#777777] truncate max-w-[220px]">
                          {relatedOrder?.product?.product_name || "Catalog Product"}
                        </div>
                      </td>

                      {/* Dispute Reason */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#D4D4D4] max-w-[260px] truncate">
                          {dispute.dispute_reason}
                        </div>
                        <div className="text-[11px] text-[#777777] line-clamp-1 max-w-[280px]">
                          {dispute.description}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dispute.status)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[#A3A3A3]">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/disputes/${dispute.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors"
                          >
                            Dossier
                          </Link>
                          <Link
                            href={`/dashboard/reports?order_id=${dispute.order_id}`}
                            className="p-1.5 rounded-lg text-[#777777] hover:text-white hover:bg-white/[0.06] transition-colors"
                            title="Download Certified PDF Report"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
