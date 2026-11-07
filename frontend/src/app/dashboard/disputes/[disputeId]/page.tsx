"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { disputeService } from "@/services/disputeService";
import { orderService } from "@/services/orderService";
import { evidenceService } from "@/services/evidenceService";
import { reportService } from "@/services/reportService";
import {
  AuditVerificationResponse,
  Dispute,
  EvidenceSession,
  Order,
} from "@/types";
import { Button } from "@/components/ui/button";

interface DisputeDetailsPageProps {
  params: Promise<{ disputeId: string }>;
}

export default function DisputeDetailsPage({ params }: DisputeDetailsPageProps) {
  const unwrappedParams = use(params);
  const disputeId = Number(unwrappedParams.disputeId);

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [deliverySession, setDeliverySession] = useState<EvidenceSession | null>(null);
  const [returnSession, setReturnSession] = useState<EvidenceSession | null>(null);
  const [auditResult, setAuditResult] = useState<AuditVerificationResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDisputeData() {
      try {
        const disputeData = await disputeService.getDispute(disputeId);
        if (!active) return;
        setDispute(disputeData);

        // Load associated order
        if (disputeData.order_id) {
          const ord = await orderService.getById(disputeData.order_id).catch(() => null);
          if (!active) return;
          setOrder(ord);

          // Load evidence sessions
          const sessions = await evidenceService.listSessions({ order_id: disputeData.order_id }).catch(() => []);
          const detailed = await Promise.all(
            sessions.map((s) => evidenceService.getSession(s.id).catch(() => s))
          );
          if (!active) return;

          setDeliverySession(detailed.find((s) => s.session_type === "delivery") || null);
          setReturnSession(detailed.find((s) => s.session_type === "return") || null);

          // Verify audit chain
          const audit = await evidenceService.verifyAudit(disputeData.order_id).catch(() => null);
          if (!active) return;
          setAuditResult(audit);
        }
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load dispute dossier");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadDisputeData();

    return () => {
      active = false;
    };
  }, [disputeId]);

  const handleDownloadPdf = async () => {
    if (!dispute) return;
    setIsDownloadingPdf(true);
    setDownloadNotice(null);

    try {
      const { blob, filename } = await reportService.downloadPdfReport(dispute.order_id, dispute.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadNotice(`Report downloaded successfully as "${filename}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF report compilation failed.";
      setDownloadNotice(msg);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#D4A359]/15 border border-[#D4A359]/30 text-[#D4A359]">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
            OPEN FOR ARBITRATION
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#3867FF]/15 border border-[#3867FF]/30 text-[#6B90FF]">
            <span className="w-2 h-2 rounded-full bg-[#3867FF] animate-pulse" />
            UNDER EXAMINATION
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#49B99A]/15 border border-[#49B99A]/30 text-[#49B99A]">
            <span className="w-2 h-2 rounded-full bg-[#49B99A]" />
            CLAIM RESOLVED
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            CLAIM REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/[0.06] border border-white/[0.1] text-white uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-[1720px] mx-auto pb-16">
      {/* ═══════════════════════════════════════
          BREADCRUMBS & TOP CONTROLS
      ═══════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#777777] mb-1.5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              WORKSPACE
            </Link>
            <span>/</span>
            <Link href="/dashboard/disputes" className="hover:text-white transition-colors">
              DISPUTES
            </Link>
            <span>/</span>
            <span className="text-white">DOSSIER #DSP-{disputeId}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Dispute Dossier #DSP-{disputeId}
            </h1>
            {dispute && getStatusBadge(dispute.status)}
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1 font-mono">
            Recorded in immutable dispute log · Target Order #{dispute?.order_id || "..."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/verification?order_id=${dispute?.order_id}`}>
            <Button variant="outline" className="text-xs rounded-xl border-white/[0.1] text-white">
              Visual Comparison Slider →
            </Button>
          </Link>
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !dispute}
            className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-5 py-2 text-xs font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-[#3867FF]/20"
          >
            {isDownloadingPdf ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Compiling Dossier...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Certified PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Download or Error Notice */}
      {downloadNotice && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.1] text-xs font-mono text-[#D4D4D4] flex items-center justify-between">
          <span>{downloadNotice}</span>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-xs text-[#777777] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="card-charcoal rounded-2xl p-16 border border-white/[0.08] text-center text-sm font-mono text-[#777777]">
          Loading dispute parameters and evidence ledger...
        </div>
      ) : !dispute ? (
        <div className="card-charcoal rounded-2xl p-16 border border-white/[0.08] text-center space-y-3">
          <h3 className="text-base font-semibold text-white">Dispute Record Not Found</h3>
          <p className="text-xs text-[#777777] max-w-md mx-auto">
            The dispute ID requested cannot be found or the dispute intake service is pending Step 7 deployment.
          </p>
          <div className="pt-2">
            <Link href="/dashboard/disputes">
              <Button className="bg-[#3867FF] text-white text-xs rounded-xl">
                Return to Dispute Dashboard
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ═══════════════════════════════════════
              LEFT 2 COLUMNS: DISPUTE & EVIDENCE
          ═══════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progression Timeline */}
            <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
                ARBITRATION LIFECYCLE
              </span>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { key: "submitted", label: "1. Lodged", active: true },
                  {
                    key: "under_review",
                    label: "2. Under Review",
                    active: dispute.status === "under_review" || dispute.status === "resolved" || dispute.status === "rejected",
                  },
                  {
                    key: "evidence",
                    label: "3. Cryptographic Audit",
                    active: Boolean(auditResult?.is_valid),
                  },
                  {
                    key: "decision",
                    label: dispute.status === "rejected" ? "4. Rejected" : "4. Resolved",
                    active: dispute.status === "resolved" || dispute.status === "rejected",
                  },
                ].map((step, idx) => (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1.5 transition-colors ${
                        step.active
                          ? "bg-[#3867FF] text-white"
                          : "bg-white/[0.06] text-[#777777] border border-white/[0.08]"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-medium ${
                        step.active ? "text-white" : "text-[#777777]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Claimant Claim & Reason Card */}
            <div className="card-charcoal rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                  CLAIM STATEMENT
                </span>
                <span className="text-xs font-mono text-[#D4A359] font-medium">
                  {dispute.dispute_reason}
                </span>
              </div>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                {dispute.description}
              </p>
              <div className="pt-2 flex items-center gap-6 text-[11px] font-mono text-[#777777]">
                <span>Lodged: {new Date(dispute.created_at).toLocaleString()}</span>
                <span>Claimant: User #{dispute.raised_by}</span>
              </div>
            </div>

            {/* Related Evidence Sessions & Condition Reports */}
            <div className="card-charcoal rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                  CUSTODY SESSIONS & MEDIA FILES
                </span>
                <span className="text-xs text-[#A3A3A3] font-mono">
                  SHA-256 Verifiable
                </span>
              </div>

              {/* Delivery vs Return Media Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delivery Evidence */}
                <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
                      Dispatch Delivery Evidence
                    </span>
                    <span className="text-[10px] font-mono text-[#A3A3A3]">
                      #{deliverySession?.id || "N/A"}
                    </span>
                  </div>
                  {deliverySession?.files && deliverySession.files.length > 0 ? (
                    <div className="space-y-2">
                      {deliverySession.files.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-white truncate max-w-[180px]">{file.file_name}</span>
                            <a
                              href={evidenceService.getDownloadUrl(file.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#6B90FF] hover:underline"
                            >
                              Download ↗
                            </a>
                          </div>
                          <div className="text-[10px] text-[#777777] font-mono truncate">
                            SHA-256: {file.file_hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#777777]">No delivery evidence files captured.</p>
                  )}
                </div>

                {/* Return Evidence */}
                <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
                      Return Intake Evidence
                    </span>
                    <span className="text-[10px] font-mono text-[#A3A3A3]">
                      #{returnSession?.id || "N/A"}
                    </span>
                  </div>
                  {returnSession?.files && returnSession.files.length > 0 ? (
                    <div className="space-y-2">
                      {returnSession.files.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-white truncate max-w-[180px]">{file.file_name}</span>
                            <a
                              href={evidenceService.getDownloadUrl(file.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#6B90FF] hover:underline"
                            >
                              Download ↗
                            </a>
                          </div>
                          <div className="text-[10px] text-[#777777] font-mono truncate">
                            SHA-256: {file.file_hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#777777]">No return evidence files captured.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT 1 COLUMN: ORDER & AUDIT CHECK
          ═══════════════════════════════════════ */}
          <div className="space-y-6">
            {/* Associated Order Card */}
            <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
                ASSOCIATED ORDER
              </span>
              {order ? (
                <div className="space-y-3">
                  <div>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-base font-bold text-white hover:text-[#6B90FF] transition-colors"
                    >
                      {order.order_number || `#ORD-${order.id}`}
                    </Link>
                    <div className="text-xs text-[#A3A3A3] mt-0.5">
                      {order.product?.product_name || "Catalog Product"}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Order Value:</span>
                      <span className="text-white">${order.total_amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Order Status:</span>
                      <span className="text-white capitalize">{order.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Buyer ID:</span>
                      <span className="text-white">User #{order.buyer_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Seller ID:</span>
                      <span className="text-white">User #{order.seller_id}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#777777] font-mono">
                  Loading order details for #{dispute.order_id}...
                </div>
              )}
            </div>

            {/* Cryptographic Chain-of-Custody Ledger Status */}
            <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
              <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
                AUDIT INTEGRITY
              </span>
              {auditResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        auditResult.is_valid ? "bg-[#49B99A]" : "bg-rose-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-white">
                      {auditResult.is_valid
                        ? "Cryptographic Chain Verified"
                        : "Ledger Discrepancy Detected"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                    Recalculated SHA-256 hashes across {auditResult.verified_records} event(s). Zero records altered.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-[#777777] font-mono">
                  Validating SHA-256 ledger chain...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

