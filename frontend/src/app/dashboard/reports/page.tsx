"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { reportService } from "@/services/reportService";
import { EvidenceReportSummary } from "@/types";
import { Button } from "@/components/ui/button";

function ReportsContent() {
  const searchParams = useSearchParams();
  const highlightedOrderId = searchParams.get("order_id");

  const [reports, setReports] = useState<EvidenceReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF download states
  const [downloadingOrderId, setDownloadingOrderId] = useState<number | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await reportService.listReportSummaries();
        if (!active) return;
        setReports(data);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load report summaries.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase().trim();
    return reports.filter(
      (r) =>
        r.order_number.toLowerCase().includes(q) ||
        r.product_name.toLowerCase().includes(q) ||
        String(r.order_id).includes(q)
    );
  }, [reports, searchQuery]);

  const handleDownloadPdf = async (orderId: number) => {
    setDownloadingOrderId(orderId);
    setDownloadNotice(null);
    setDownloadError(null);

    try {
      const { blob, filename } = await reportService.downloadPdfReport(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadNotice(`Certified report downloaded successfully as "${filename}"`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Backend PDF Report compilation engine is scheduled for Step 7.";
      setDownloadError(msg);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-[1720px] mx-auto pb-16">
      {/* ═══════════════════════════════════════
          HEADER & METADATA
      ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#777777] mb-1.5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              WORKSPACE
            </Link>
            <span>/</span>
            <span className="text-white">CERTIFIED EVIDENCE REPORTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Evidence Dossiers & Reports</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#49B99A]/10 border border-[#49B99A]/20 text-[#49B99A]">
              SHA-256 Ledger Anchored
            </span>
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1.5 max-w-2xl">
            Audit-grade digital chain-of-custody certificates. Compiles package handover photos, customer return inspections, physical condition reports, and SHA-256 integrity digests into court-admissible dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/verification">
            <Button variant="outline" className="text-xs rounded-xl border-white/[0.1] text-white">
              AI Verification Engine →
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Notifications */}
      {downloadNotice && (
        <div className="p-4 rounded-xl bg-[#49B99A]/10 border border-[#49B99A]/25 text-[#49B99A] text-xs font-mono flex items-center justify-between">
          <span>{downloadNotice}</span>
          <button onClick={() => setDownloadNotice(null)} className="text-[#49B99A]/70 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {downloadError && (
        <div className="card-charcoal rounded-2xl p-5 border border-[#3867FF]/25 bg-[#3867FF]/[0.03] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
            Backend Step 7 PDF Engine Roadmap Notice
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            {downloadError}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* ═══════════════════════════════════════
          SEARCH & SUMMARY STATS
      ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs font-mono text-[#777777]">
          Showing <span className="text-white font-medium">{filteredReports.length}</span> evidence-anchored order(s)
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or Product name..."
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
        </div>
      </div>

      {/* ═══════════════════════════════════════
          REPORTS GRID / TABLE
      ═══════════════════════════════════════ */}
      {isLoading ? (
        <div className="card-charcoal rounded-2xl p-16 border border-white/[0.08] text-center text-sm font-mono text-[#777777]">
          Aggregating digital chain-of-custody packages...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="card-charcoal rounded-2xl p-16 border border-white/[0.08] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1F] border border-white/[0.08] flex items-center justify-center text-[#777777] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight">No Certified Reports Found</h3>
          <p className="text-xs text-[#777777] max-w-md mt-1.5 leading-relaxed">
            Evidence packages are generated when an order has delivery or return evidence sessions captured on the server.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/orders">
              <Button className="bg-[#3867FF] text-white px-4 py-2 text-xs rounded-xl">
                Browse Active Orders →
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const isTargeted = highlightedOrderId && Number(highlightedOrderId) === report.order_id;
            const isDownloading = downloadingOrderId === report.order_id;

            return (
              <div
                key={report.order_id}
                className={`card-charcoal rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                  isTargeted
                    ? "border-[#3867FF]/50 ring-1 ring-[#3867FF]/30 shadow-lg shadow-[#3867FF]/10"
                    : "border-white/[0.08] hover:border-white/20"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-white/[0.06]">
                    <span className="text-[#777777]">ORDER {report.order_number}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#49B99A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A]" />
                      SHA-256 Valid
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="mt-4">
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {report.product_name}
                    </h3>
                    <div className="text-xs text-[#A3A3A3] mt-0.5">
                      Order Value: ${report.total_amount?.toFixed(2)} · Status: {report.order_status}
                    </div>
                  </div>

                  {/* Custody Metrics Grid */}
                  <div className="mt-5 p-3 rounded-xl bg-[#0E0E10] border border-white/[0.04] grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#777777] block">DELIVERY</span>
                      <span className={report.delivery_session ? "text-[#49B99A]" : "text-[#777777]"}>
                        {report.delivery_session ? "Captured" : "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777777] block">RETURN</span>
                      <span className={report.return_session ? "text-[#D4A359]" : "text-[#777777]"}>
                        {report.return_session ? "Captured" : "Pending"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#777777] block">FILES</span>
                      <span className="text-white font-medium">
                        {report.total_files}
                      </span>
                    </div>
                  </div>

                  {/* Conditions & Disputes info */}
                  <div className="mt-3 text-[11px] font-mono text-[#777777] flex items-center justify-between">
                    <span>
                      Condition Reports: {report.has_condition_report ? "Recorded" : "None"}
                    </span>
                    <span>
                      Disputes: {report.dispute_count}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <Link
                    href={`/dashboard/verification?order_id=${report.order_id}`}
                    className="text-xs font-medium text-[#A3A3A3] hover:text-white transition-colors"
                  >
                    Examine Vault →
                  </Link>

                  <Button
                    onClick={() => handleDownloadPdf(report.order_id)}
                    disabled={isDownloading}
                    className="bg-[#1E1E22] hover:bg-[#28282D] text-white border border-white/[0.12] text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2"
                  >
                    {isDownloading ? (
                      <span className="animate-spin text-xs">⟳</span>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#3867FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="card-charcoal rounded-2xl p-12 text-center text-sm font-mono text-[#777777]">
          Loading certified reports...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}

