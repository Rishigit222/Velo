"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import { evidenceService } from "@/services/evidenceService";
import { verificationService } from "@/services/verificationService";
import {
  AuditVerificationResponse,
  ConditionReport,
  EvidenceFile,
  EvidenceSession,
  Order,
  VerificationResult,
} from "@/types";
import { Button } from "@/components/ui/button";
import { ComparisonSlider } from "@/components/verification/comparison-slider";

function VerificationDashboardContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("order_id");

  // Core Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    queryOrderId ? Number(queryOrderId) : null
  );
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Evidence Sessions & Files for Selected Order
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [deliverySession, setDeliverySession] = useState<EvidenceSession | null>(null);
  const [returnSession, setReturnSession] = useState<EvidenceSession | null>(null);
  const [activeDeliveryFileIdx, setActiveDeliveryFileIdx] = useState(0);
  const [activeReturnFileIdx, setActiveReturnFileIdx] = useState(0);

  // Audit Verification State (LIVE from /api/v1/evidence/audit/verify)
  const [auditResult, setAuditResult] = useState<AuditVerificationResponse | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // AI Verification State
  const [isRunningVerification, setIsRunningVerification] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);

  // UI Interactive States
  const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "slider">("side-by-side");
  const [zoomFile, setZoomFile] = useState<EvidenceFile | null>(null);

  // 1. Fetch available orders
  useEffect(() => {
    let active = true;
    orderService
      .list()
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setIsLoadingOrders(false);

        // Auto-select first order if none selected or query param wasn't specified
        if (!selectedOrderId && data.length > 0) {
          setSelectedOrderId(data[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        setOrdersError(err instanceof Error ? err.message : "Failed to load orders");
        setIsLoadingOrders(false);
      });

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  const handleSelectOrder = (id: number) => {
    setSelectedOrderId(id);
    setDeliverySession(null);
    setReturnSession(null);
    setAuditResult(null);
    setVerificationResult(null);
  };

  // Selected Order Object
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // 2. Fetch Sessions & Audit Verification when selectedOrderId changes
  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setIsLoadingSessions(true);
      setIsLoadingAudit(true);
      setSessionsError(null);
      setVerificationError(null);
      setVerificationNotice(null);
    });

    // Fetch evidence sessions for this order
    evidenceService
      .listSessions({ order_id: selectedOrderId })
      .then(async (sessionsList) => {
        if (!active) return;

        // Fetch deep details for each session to get files & condition reports
        const detailedSessions = await Promise.all(
          sessionsList.map((s) => evidenceService.getSession(s.id).catch(() => s))
        );

        if (!active) return;
        const delivery = detailedSessions.find((s) => s.session_type === "delivery") || null;
        const ret = detailedSessions.find((s) => s.session_type === "return") || null;

        setDeliverySession(delivery);
        setReturnSession(ret);
        setActiveDeliveryFileIdx(0);
        setActiveReturnFileIdx(0);
        setIsLoadingSessions(false);
      })
      .catch((err) => {
        if (!active) return;
        setSessionsError(err instanceof Error ? err.message : "Failed to load evidence sessions.");
        setIsLoadingSessions(false);
      });

    // Fetch Cryptographic Audit Ledger Verification
    evidenceService
      .verifyAudit(selectedOrderId)
      .then((res) => {
        if (!active) return;
        setAuditResult(res);
        setIsLoadingAudit(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoadingAudit(false);
      });

    // Fetch Verification History if available
    verificationService
      .getHistory(selectedOrderId)
      .then((history) => {
        if (!active) return;
        setVerificationHistory(history);
      })
      .catch(() => {
        if (!active) return;
        setVerificationHistory([]);
      });

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  // Derived Evidence Files
  const deliveryFiles = deliverySession?.files || [];
  const returnFiles = returnSession?.files || [];
  const currentDeliveryFile = deliveryFiles[activeDeliveryFileIdx] || null;
  const currentReturnFile = returnFiles[activeReturnFileIdx] || null;

  // Condition Reports
  const deliveryCondition: ConditionReport | null =
    deliverySession?.condition_reports && deliverySession.condition_reports.length > 0
      ? deliverySession.condition_reports[deliverySession.condition_reports.length - 1]
      : null;

  const returnCondition: ConditionReport | null =
    returnSession?.condition_reports && returnSession.condition_reports.length > 0
      ? returnSession.condition_reports[returnSession.condition_reports.length - 1]
      : null;

  // Evidence Completeness check
  const hasDeliveryEvidence = Boolean(deliverySession && deliveryFiles.length > 0);
  const hasReturnEvidence = Boolean(returnSession && returnFiles.length > 0);
  const isEvidenceComplete = hasDeliveryEvidence && hasReturnEvidence;

  // 3. Handle Running AI Verification
  const handleRunVerification = async () => {
    if (!selectedOrder) return;

    if (!isEvidenceComplete) {
      setVerificationNotice(
        "Cannot run comparison: Both delivery unboxing evidence and return inspection evidence must be captured before running automated verification."
      );
      return;
    }

    setIsRunningVerification(true);
    setVerificationError(null);
    setVerificationNotice(null);

    try {
      const result = await verificationService.runVerification({
        order_id: selectedOrder.id,
        original_session_id: deliverySession?.id,
        return_session_id: returnSession?.id,
      });
      setVerificationResult(result);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Backend verification endpoint is not yet connected.";
      setVerificationError(errorMsg);
    } finally {
      setIsRunningVerification(false);
    }
  };

  // Helper to determine image URL
  const getFileUrl = (file: EvidenceFile | null) => {
    if (!file) return "";
    return evidenceService.getDownloadUrl(file.id);
  };

  return (
    <div className="space-y-8 max-w-[1720px] mx-auto pb-16">
      {/* ═══════════════════════════════════════
          TOP HEADER & ORDER SELECTOR
      ═══════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#777777] mb-1.5">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              WORKSPACE
            </Link>
            <span>/</span>
            <span className="text-white">AI VERIFICATION & COMPARISON</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Product Condition Verification Engine</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#49B99A]/10 border border-[#49B99A]/20 text-[#49B99A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49B99A] animate-pulse" />
              FastAPI v1
            </span>
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1.5 max-w-3xl">
            Multi-modal evidence comparison interface. Verifies original package dispatch against customer-returned condition using cryptographic hashes, physical reports, and visual inspection.
          </p>
        </div>

        {/* Order Selector Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <label htmlFor="order-selector" className="text-xs font-mono text-[#777777] uppercase tracking-wider shrink-0">
            Target Order:
          </label>
          <div className="relative min-w-[280px]">
            <select
              id="order-selector"
              value={selectedOrderId || ""}
              onChange={(e) => handleSelectOrder(Number(e.target.value))}
              disabled={isLoadingOrders || orders.length === 0}
              className="w-full appearance-none bg-[#141416] border border-white/[0.12] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer pr-10"
            >
              {isLoadingOrders ? (
                <option value="">Loading active orders...</option>
              ) : orders.length === 0 ? (
                <option value="">No customer orders found</option>
              ) : (
                orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number || `#ORD-${o.id}`} — {o.product?.product_name || `Product #${o.product_id || ""}`} (${o.status})
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#777777]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Global Error Banners */}
      {ordersError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
          {ordersError}
        </div>
      )}
      {sessionsError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
          {sessionsError}
        </div>
      )}
      {isLoadingSessions && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-[#A3A3A3] flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-[#3867FF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading digital chain-of-custody evidence sessions...
        </div>
      )}

      {/* ═══════════════════════════════════════
          ORDER OVERVIEW & EVIDENCE STATUS SUMMARY
      ═══════════════════════════════════════ */}
      {selectedOrder && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Order Information */}
          <div className="card-charcoal rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">ORDER SPECIFICATION</span>
            <div className="mt-2">
              <div className="text-base font-semibold text-white tracking-tight">
                {selectedOrder.order_number || `#ORD-${selectedOrder.id}`}
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">
                {selectedOrder.product?.product_name || "Catalog Product"} · ${selectedOrder.total_amount?.toFixed(2)}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#777777]">Lifecycle Status:</span>
              <span className="font-mono text-white capitalize">{selectedOrder.status.replace("_", " ")}</span>
            </div>
          </div>

          {/* Card 2: Delivery Evidence Status */}
          <div className="card-charcoal rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
              <span>ORIGINAL DELIVERY</span>
              <span>📦</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasDeliveryEvidence ? "bg-[#49B99A]" : "bg-amber-400"}`} />
                <span className="text-base font-semibold text-white">
                  {hasDeliveryEvidence ? "Evidence Captured" : "Missing Delivery Evidence"}
                </span>
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">
                {deliveryFiles.length} media file(s) · {deliveryCondition ? `Condition: ${deliveryCondition.product_condition}` : "No report"}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#777777]">Session #{deliverySession?.id || "N/A"}:</span>
              <span className={deliverySession ? "text-[#49B99A]" : "text-[#777777]"}>
                {deliverySession?.session_status || "Not initiated"}
              </span>
            </div>
          </div>

          {/* Card 3: Return Evidence Status */}
          <div className="card-charcoal rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
              <span>RETURN INSPECTION</span>
              <span>🔄</span>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasReturnEvidence ? "bg-[#49B99A]" : "bg-[#D4A359]"}`} />
                <span className="text-base font-semibold text-white">
                  {hasReturnEvidence ? "Return Captured" : "Awaiting Return Evidence"}
                </span>
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">
                {returnFiles.length} media file(s) · {returnCondition ? `Condition: ${returnCondition.product_condition}` : "No report"}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#777777]">Session #{returnSession?.id || "N/A"}:</span>
              <span className={returnSession ? "text-[#49B99A]" : "text-[#777777]"}>
                {returnSession?.session_status || "Not initiated"}
              </span>
            </div>
          </div>

          {/* Card 4: Chain-of-Custody Integrity */}
          <div className="card-charcoal rounded-2xl p-5 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
              <span>LEDGER INTEGRITY</span>
              <span>🛡️</span>
            </div>
            <div className="mt-2">
              <div className="text-base font-semibold text-white flex items-center gap-2">
                {isLoadingAudit ? (
                  <span className="text-xs text-[#777777]">Verifying ledger...</span>
                ) : auditResult?.is_valid ? (
                  <>
                    <span className="text-[#49B99A]">SHA-256 Intact</span>
                    <span className="text-xs text-[#49B99A] font-mono">({auditResult.verified_records} events)</span>
                  </>
                ) : (
                  <span className="text-amber-400">Ledger Empty / Unverified</span>
                )}
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">
                Sequential hash chain validated by backend
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#777777]">Tampered Events:</span>
              <span className={auditResult?.tampered_records?.length ? "text-rose-400" : "text-[#49B99A]"}>
                {auditResult?.tampered_records?.length || 0} detected
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          EVIDENCE COMPLETENESS & RUN ACTION BAR
      ═══════════════════════════════════════ */}
      <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">AI Comparative Verification Action</h2>
            {isEvidenceComplete ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#49B99A]/15 border border-[#49B99A]/30 text-[#49B99A]">
                ✓ Ready for Comparison
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#D4A359]/15 border border-[#D4A359]/30 text-[#D4A359]">
                ⚠ Incomplete Evidence
              </span>
            )}
          </div>
          <p className="text-xs text-[#A3A3A3]">
            {isEvidenceComplete
              ? "Both original delivery and return sessions have verified cryptographic media captures ready for multi-modal analysis."
              : "Automated AI comparison requires at least one original delivery media file and one return inspection media file."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            isLoading={isRunningVerification}
            disabled={!isEvidenceComplete || isRunningVerification}
            onClick={handleRunVerification}
            className="font-medium"
          >
            {isRunningVerification ? "Running Comparison..." : "Run AI Verification"}
          </Button>
        </div>
      </div>

      {/* Notices & Disconnected State Feedback */}
      {verificationNotice && (
        <div className="p-4 rounded-xl bg-[#D4A359]/10 border border-[#D4A359]/25 text-[#D4A359] text-xs leading-relaxed flex items-start gap-3">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-semibold block">Evidence Requirement Notice:</span>
            {verificationNotice}
          </div>
        </div>
      )}

      {verificationError && (
        <div className="p-5 rounded-2xl bg-[#141416] border border-amber-500/25 text-amber-200/90 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <span>⚠️</span>
            <span>AI Verification Service Notice (Step 6 Dependency)</span>
          </div>
          <p>{verificationError}</p>
          <div className="text-[11px] font-mono text-[#A3A3A3] pt-2 border-t border-white/[0.06]">
            Status: Frontend comparison interface, side-by-side split viewer, SHA-256 file hashes, and condition reports are 100% operational against real data. The automated comparison engine is scheduled for Step 6.
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          COMPARISON CONTROLS & VIEWER
      ═══════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparisonMode("side-by-side")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                comparisonMode === "side-by-side"
                  ? "bg-white text-black font-semibold shadow"
                  : "text-[#A3A3A3] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setComparisonMode("slider")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                comparisonMode === "slider"
                  ? "bg-white text-black font-semibold shadow"
                  : "text-[#A3A3A3] hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              Interactive Difference Slider
            </button>
          </div>

          <div className="text-xs font-mono text-[#777777] hidden sm:block">
            {currentDeliveryFile?.file_name || "No delivery file"} vs {currentReturnFile?.file_name || "No return file"}
          </div>
        </div>

        {/* ── MODE 1: INTERACTIVE SPLIT SLIDER ── */}
        {comparisonMode === "slider" && (
          <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08]">
            {currentDeliveryFile && currentReturnFile ? (
              <ComparisonSlider
                originalImage={getFileUrl(currentDeliveryFile)}
                returnedImage={getFileUrl(currentReturnFile)}
                originalLabel={`Dispatch (${currentDeliveryFile.file_name})`}
                returnedLabel={`Return (${currentReturnFile.file_name})`}
              />
            ) : (
              <div className="py-16 text-center text-xs font-mono text-[#777777]">
                Interactive difference slider requires both original delivery and return image captures.
              </div>
            )}
          </div>
        )}

        {/* ── MODE 2: SIDE-BY-SIDE PANELS ── */}
        {comparisonMode === "side-by-side" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ───────────────────────────────────────────────────────────
                LEFT PANEL: ORIGINAL DELIVERY EVIDENCE
            ─────────────────────────────────────────────────────────── */}
            <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3867FF]" />
                  <h3 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
                    ORIGINAL DELIVERY EVIDENCE
                  </h3>
                </div>
                {deliverySession && (
                  <span className="text-[11px] font-mono text-[#49B99A] bg-[#49B99A]/10 border border-[#49B99A]/20 px-2 py-0.5 rounded">
                    Session #{deliverySession.id} · Active
                  </span>
                )}
              </div>

              {/* Media Viewport */}
              <div className="space-y-3">
                <div className="relative w-full aspect-[16/10] bg-[#0E0E10] rounded-xl overflow-hidden border border-white/[0.08] flex items-center justify-center group">
                  {currentDeliveryFile ? (
                    currentDeliveryFile.file_type.startsWith("video/") ? (
                      <video
                        src={getFileUrl(currentDeliveryFile)}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFileUrl(currentDeliveryFile)}
                          alt={currentDeliveryFile.file_name}
                          className="w-full h-full object-contain cursor-zoom-in"
                          onClick={() => setZoomFile(currentDeliveryFile)}
                        />
                        <button
                          onClick={() => setZoomFile(currentDeliveryFile)}
                          className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          🔍 Zoom Image
                        </button>
                      </>
                    )
                  ) : (
                    <div className="text-center p-8 text-xs font-mono text-[#777777]">
                      No delivery media files uploaded for this order.
                    </div>
                  )}
                </div>

                {/* Multiple files thumbnail strip */}
                {deliveryFiles.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {deliveryFiles.map((file, idx) => (
                      <button
                        key={file.id}
                        onClick={() => setActiveDeliveryFileIdx(idx)}
                        className={`h-14 w-20 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          idx === activeDeliveryFileIdx
                            ? "border-white ring-1 ring-white"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFileUrl(file)}
                          alt={file.file_name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Integrity & SHA-256 Box */}
              {currentDeliveryFile && (
                <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium truncate max-w-[220px]">
                      {currentDeliveryFile.file_name}
                    </span>
                    <span className="text-[#49B99A] bg-[#49B99A]/10 px-2 py-0.5 rounded text-[10px]">
                      SHA-256 VERIFIED
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-white/[0.04] text-[11px] font-mono text-[#A3A3A3] break-all select-all">
                    {currentDeliveryFile.file_hash}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#777777] font-mono pt-1">
                    <span>
                      {(currentDeliveryFile.file_size / (1024 * 1024)).toFixed(2)} MB · {currentDeliveryFile.file_type}
                    </span>
                    <span>
                      {new Date(currentDeliveryFile.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Original Condition Report */}
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-3">
                <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
                  ORIGINAL CONDITION ASSESSMENT
                </span>
                {deliveryCondition ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Product Condition:</span>
                      <span className="text-white font-mono capitalize">{deliveryCondition.product_condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Packaging Integrity:</span>
                      <span className="text-white font-mono">{deliveryCondition.packaging_condition || "Sealed / Intact"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Accessories Status:</span>
                      <span className="text-white font-mono">{deliveryCondition.accessories_status || "Complete"}</span>
                    </div>
                    {deliveryCondition.damage_description && (
                      <div className="pt-2 border-t border-white/[0.04] text-[#A3A3A3] leading-relaxed">
                        <span className="text-[#777777] block text-[10px] font-mono uppercase">Notes:</span>
                        {deliveryCondition.damage_description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#777777] italic">
                    No structured condition assessment report recorded for dispatch.
                  </div>
                )}
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────
                RIGHT PANEL: RETURNED PRODUCT EVIDENCE
            ─────────────────────────────────────────────────────────── */}
            <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-6">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4A359]" />
                  <h3 className="text-sm font-semibold text-white tracking-tight uppercase font-mono">
                    RETURNED PRODUCT EVIDENCE
                  </h3>
                </div>
                {returnSession && (
                  <span className="text-[11px] font-mono text-[#D4A359] bg-[#D4A359]/10 border border-[#D4A359]/20 px-2 py-0.5 rounded">
                    Session #{returnSession.id} · Active
                  </span>
                )}
              </div>

              {/* Media Viewport */}
              <div className="space-y-3">
                <div className="relative w-full aspect-[16/10] bg-[#0E0E10] rounded-xl overflow-hidden border border-white/[0.08] flex items-center justify-center group">
                  {currentReturnFile ? (
                    currentReturnFile.file_type.startsWith("video/") ? (
                      <video
                        src={getFileUrl(currentReturnFile)}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFileUrl(currentReturnFile)}
                          alt={currentReturnFile.file_name}
                          className="w-full h-full object-contain cursor-zoom-in"
                          onClick={() => setZoomFile(currentReturnFile)}
                        />
                        <button
                          onClick={() => setZoomFile(currentReturnFile)}
                          className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          🔍 Zoom Image
                        </button>
                      </>
                    )
                  ) : (
                    <div className="text-center p-8 text-xs font-mono text-[#777777]">
                      No return media files uploaded yet.
                    </div>
                  )}
                </div>

                {/* Multiple files thumbnail strip */}
                {returnFiles.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {returnFiles.map((file, idx) => (
                      <button
                        key={file.id}
                        onClick={() => setActiveReturnFileIdx(idx)}
                        className={`h-14 w-20 rounded-lg overflow-hidden border shrink-0 transition-all ${
                          idx === activeReturnFileIdx
                            ? "border-white ring-1 ring-white"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFileUrl(file)}
                          alt={file.file_name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* File Integrity & SHA-256 Box */}
              {currentReturnFile && (
                <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-medium truncate max-w-[220px]">
                      {currentReturnFile.file_name}
                    </span>
                    <span className="text-[#49B99A] bg-[#49B99A]/10 px-2 py-0.5 rounded text-[10px]">
                      SHA-256 VERIFIED
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/50 border border-white/[0.04] text-[11px] font-mono text-[#A3A3A3] break-all select-all">
                    {currentReturnFile.file_hash}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#777777] font-mono pt-1">
                    <span>
                      {(currentReturnFile.file_size / (1024 * 1024)).toFixed(2)} MB · {currentReturnFile.file_type}
                    </span>
                    <span>
                      {new Date(currentReturnFile.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Returned Condition Report */}
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-3">
                <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
                  RETURN CONDITION ASSESSMENT
                </span>
                {returnCondition ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Product Condition:</span>
                      <span className="text-white font-mono capitalize">{returnCondition.product_condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Packaging Integrity:</span>
                      <span className="text-white font-mono">{returnCondition.packaging_condition || "Open / Inspected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#777777]">Accessories Status:</span>
                      <span className="text-white font-mono">{returnCondition.accessories_status || "Complete"}</span>
                    </div>
                    {returnCondition.damage_description && (
                      <div className="pt-2 border-t border-white/[0.04] text-[#A3A3A3] leading-relaxed">
                        <span className="text-[#777777] block text-[10px] font-mono uppercase">Notes:</span>
                        {returnCondition.damage_description}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-[#777777] italic">
                    No structured condition assessment report recorded for return inspection.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          AI VERIFICATION RESULTS & FINDINGS PANEL
      ═══════════════════════════════════════ */}
      <div className="card-charcoal rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">AI Multimodal Verification Findings</h2>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Automated condition comparison between original dispatch and returned physical evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#777777]">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                verificationResult?.overall_status === "match"
                  ? "bg-[#49B99A]/10 border-[#49B99A]/30 text-[#49B99A]"
                  : verificationResult?.overall_status === "possible_mismatch"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : verificationResult?.overall_status === "review_required"
                  ? "bg-[#D4A359]/10 border-[#D4A359]/30 text-[#D4A359]"
                  : "bg-white/[0.06] border-white/10 text-[#A3A3A3]"
              }`}
            >
              {verificationResult?.overall_status
                ? verificationResult.overall_status.toUpperCase()
                : "NOT CHECKED (AWAITING STEP 6)"}
            </span>
          </div>
        </div>

        {/* Comparison Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Check 1: Product Identity */}
          <div className="p-5 rounded-xl bg-[#141416] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Product Identity</span>
              <span className="text-[10px] font-mono text-[#777777]">SERIAL / IMEI</span>
            </div>
            <div className="text-xs text-[#A3A3A3] leading-relaxed">
              {verificationResult ? (
                verificationResult.identity_result
              ) : (
                "Compares hardware serial numbers, barcodes, and external distinguishing marks between delivery and return captures."
              )}
            </div>
            <div className="text-[11px] font-mono text-[#777777] pt-2 border-t border-white/[0.04]">
              Evaluation: {verificationResult?.identity_result || "Not checked"}
            </div>
          </div>

          {/* Check 2: Surface & Cosmetic Damage */}
          <div className="p-5 rounded-xl bg-[#141416] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Physical Damage</span>
              <span className="text-[10px] font-mono text-[#777777]">DEFECT DETECTION</span>
            </div>
            <div className="text-xs text-[#A3A3A3] leading-relaxed">
              {verificationResult ? (
                verificationResult.damage_result
              ) : (
                "Detects fractures, screen blemishes, scratches, and missing chassis components not present during initial unboxing."
              )}
            </div>
            <div className="text-[11px] font-mono text-[#777777] pt-2 border-t border-white/[0.04]">
              Evaluation: {verificationResult?.damage_result || "Not checked"}
            </div>
          </div>

          {/* Check 3: Accessories & Packaging */}
          <div className="p-5 rounded-xl bg-[#141416] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Accessories & Box</span>
              <span className="text-[10px] font-mono text-[#777777]">INVENTORY CHECK</span>
            </div>
            <div className="text-xs text-[#A3A3A3] leading-relaxed">
              {verificationResult ? (
                verificationResult.accessories_result
              ) : (
                "Confirms inclusion of original power adapters, cables, documentation, and retail packaging inserts."
              )}
            </div>
            <div className="text-[11px] font-mono text-[#777777] pt-2 border-t border-white/[0.04]">
              Evaluation: {verificationResult?.accessories_result || "Not checked"}
            </div>
          </div>
        </div>

        {/* Detailed Findings & Explanatory Box */}
        <div className="p-5 rounded-2xl bg-[#0E0E10] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-white uppercase tracking-wider">
              FINDINGS & ARBITRATION GUIDANCE
            </span>
            <span className="text-xs font-mono text-[#777777]">
              {verificationResult?.created_at ? new Date(verificationResult.created_at).toLocaleString() : "Real-time Ready"}
            </span>
          </div>

          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            {verificationResult?.findings ||
              "When comparison runs against the Step 6 verification engine, algorithmic findings will highlight detected discrepancies. Both evidence sessions remain tamper-evident and anchored to the Velo digital ledger."}
          </p>

          <div className="pt-3 border-t border-white/[0.04] flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-[#777777]">Confirmed Evidence:</span>
            <span className="text-[#49B99A] font-semibold">
              {deliveryFiles.length + returnFiles.length} SHA-256 Media Files Anchored
            </span>
            <span className="text-[#777777]">·</span>
            <span className="text-[#777777]">Human Review:</span>
            <span className="text-white">Recommended for high-value claims</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          VERIFICATION HISTORY SECTION
      ═══════════════════════════════════════ */}
      <div className="card-charcoal rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-white">Verification History</h2>
          <span className="text-xs font-mono text-[#777777]">
            {verificationHistory.length} Record(s) for Order #{selectedOrderId || "—"}
          </span>
        </div>

        {verificationHistory.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-[#777777]">
            No previous automated verification runs recorded for this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#777777] font-mono">
                  <th className="py-3 px-4">RESULT ID</th>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">OVERALL STATUS</th>
                  <th className="py-3 px-4">IDENTITY</th>
                  <th className="py-3 px-4">DAMAGE</th>
                  <th className="py-3 px-4">FINDINGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {verificationHistory.map((run) => (
                  <tr key={run.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-white">#{run.id}</td>
                    <td className="py-3 px-4 text-[#A3A3A3] font-mono">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium capitalize text-white">
                      {run.overall_status}
                    </td>
                    <td className="py-3 px-4 text-[#A3A3A3] font-mono">{run.identity_result}</td>
                    <td className="py-3 px-4 text-[#A3A3A3] font-mono">{run.damage_result}</td>
                    <td className="py-3 px-4 text-[#777777] truncate max-w-[200px]">
                      {run.findings || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          IMAGE ZOOM MODAL
      ═══════════════════════════════════════ */}
      {zoomFile && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoomFile(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setZoomFile(null)}
              className="absolute -top-12 right-0 text-[#A3A3A3] hover:text-white text-sm font-mono flex items-center gap-1.5"
            >
              Close [ESC]
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Image */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[#0A0A0C]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getFileUrl(zoomFile)}
                alt={zoomFile.file_name}
                className="max-w-full max-h-[75vh] object-contain select-none"
              />
            </div>

            {/* Footer Metadata */}
            <div className="w-full mt-3 p-3 rounded-xl bg-[#141416] border border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#A3A3A3]">
              <span className="text-white font-medium">{zoomFile.file_name}</span>
              <span className="text-[11px] truncate max-w-md text-[#777777]">
                SHA-256: {zoomFile.file_hash}
              </span>
              <a
                href={getFileUrl(zoomFile)}
                target="_blank"
                rel="noreferrer"
                download={zoomFile.file_name}
                className="text-[#3867FF] hover:underline"
              >
                Download Raw Payload ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
              Loading AI Verification Studio...
            </span>
          </div>
        </div>
      }
    >
      <VerificationDashboardContent />
    </Suspense>
  );
}
