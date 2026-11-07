"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import { evidenceService } from "@/services/evidenceService";
import { disputeService } from "@/services/disputeService";
import { DisputeReason, EvidenceSession, Order } from "@/types";
import { Button } from "@/components/ui/button";

const DISPUTE_REASONS: DisputeReason[] = [
  "Product returned damaged",
  "Missing accessories",
  "Product identity mismatch",
  "Packaging issue",
  "Incorrect return",
  "Other",
];

function NewDisputeContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("order_id");

  // Step state: 1 = Details, 2 = Review & Confirm
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form Fields
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    initialOrderId ? Number(initialOrderId) : null
  );
  const [selectedReason, setSelectedReason] = useState<DisputeReason>(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState("");

  const handleSelectOrder = (id: number) => {
    setSelectedOrderId(id);
    setSessions([]);
  };

  // Loaded Evidence for Selected Order
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [sessions, setSessions] = useState<EvidenceSession[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendDependencyNotice, setBackendDependencyNotice] = useState<string | null>(null);
  const [successDisputeId, setSuccessDisputeId] = useState<number | null>(null);

  // 1. Load active orders
  useEffect(() => {
    let active = true;
    orderService
      .list()
      .then((data) => {
        if (!active) return;
        setOrders(data);
        setIsLoadingOrders(false);
        if (!selectedOrderId && data.length > 0) {
          setSelectedOrderId(data[0].id);
        }
      })
      .catch(() => {
        if (!active) return;
        setIsLoadingOrders(false);
      });

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  // 2. Fetch evidence sessions when selectedOrderId changes
  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) setIsLoadingEvidence(true);
    });

    evidenceService
      .listSessions({ order_id: selectedOrderId })
      .then(async (sessionsList) => {
        if (!active) return;
        const detailed = await Promise.all(
          sessionsList.map((s) => evidenceService.getSession(s.id).catch(() => s))
        );
        if (!active) return;
        setSessions(detailed);
        setIsLoadingEvidence(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoadingEvidence(false);
      });

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  const deliverySession = useMemo(() => {
    return sessions.find((s) => s.session_type === "delivery") || null;
  }, [sessions]);

  const returnSession = useMemo(() => {
    return sessions.find((s) => s.session_type === "return") || null;
  }, [sessions]);

  // Validation
  const isFormValid = Boolean(
    selectedOrderId && selectedReason && description.trim().length >= 10
  );

  const handleSubmit = async () => {
    if (!selectedOrderId || !isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setBackendDependencyNotice(null);

    try {
      const response = await disputeService.createDispute({
        order_id: selectedOrderId,
        dispute_reason: selectedReason,
        description: description.trim(),
      });

      // Successful backend response
      setSuccessDisputeId(response.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to lodge dispute";
      if (msg.includes("Step 7") || msg.includes("404") || msg.includes("501")) {
        setBackendDependencyNotice(
          "Backend endpoint 'POST /api/v1/disputes' is scheduled for Step 7. The dispute model is declared in SQLAlchemy, but the intake endpoint is not yet mounted. No mock dispute was created."
        );
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-16">
      {/* ═══════════════════════════════════════
          BREADCRUMBS & HEADER
      ═══════════════════════════════════════ */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#777777] mb-1.5">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            WORKSPACE
          </Link>
          <span>/</span>
          <Link href="/dashboard/disputes" className="hover:text-white transition-colors">
            DISPUTES
          </Link>
          <span>/</span>
          <span className="text-white">LODGE NEW CLAIM</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          File Evidence-Backed Dispute
        </h1>
        <p className="text-sm text-[#A3A3A3] mt-1.5 max-w-2xl">
          Submit a structured dispute linked to verified custody records. All delivery photos, return videos, and SHA-256 evidence digests are cryptographically anchored to your claim.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            currentStep === 1
              ? "bg-[#1E1E22] text-white border border-white/[0.12]"
              : "text-[#777777] hover:text-white"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-mono">
            1
          </span>
          <span>Claim Specification & Evidence</span>
        </button>

        <span className="text-[#777777] text-xs">→</span>

        <button
          disabled={!isFormValid}
          onClick={() => isFormValid && setCurrentStep(2)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            currentStep === 2
              ? "bg-[#1E1E22] text-white border border-white/[0.12]"
              : isFormValid
              ? "text-[#777777] hover:text-white"
              : "text-[#444444] cursor-not-allowed"
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-mono">
            2
          </span>
          <span>Review & Submit Dossier</span>
        </button>
      </div>

      {/* Success Notification */}
      {successDisputeId && (
        <div className="card-charcoal rounded-2xl p-8 border border-[#49B99A]/30 bg-[#49B99A]/[0.05] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#49B99A]/20 border border-[#49B99A]/40 flex items-center justify-center text-[#49B99A] mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Dispute Successfully Lodged</h3>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Your dispute has been recorded under reference ID <strong className="text-white font-mono">#DSP-{successDisputeId}</strong>.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href={`/dashboard/disputes/${successDisputeId}`}>
              <Button className="bg-[#49B99A] hover:bg-[#3EA689] text-black font-semibold px-5 py-2 text-xs rounded-xl">
                View Dispute Dossier →
              </Button>
            </Link>
            <Link href="/dashboard/disputes">
              <Button variant="outline" className="text-xs rounded-xl border-white/[0.1] text-white">
                Back to Disputes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Backend Step 7 Notice if attempted */}
      {backendDependencyNotice && (
        <div className="card-charcoal rounded-2xl p-6 border border-[#3867FF]/25 bg-[#3867FF]/[0.04] space-y-3">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
            Backend Step 7 Dependency Notice
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            {backendDependencyNotice}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link href="/dashboard/disputes">
              <button className="px-4 py-2 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors">
                ← Return to Dispute Dashboard
              </button>
            </Link>
            <Link href={`/dashboard/verification?order_id=${selectedOrderId}`}>
              <button className="px-4 py-2 rounded-xl text-xs font-mono bg-[#3867FF]/20 border border-[#3867FF]/30 text-[#88A8FF] hover:bg-[#3867FF]/30 transition-colors">
                Examine Visual Evidence Vault →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
          {submitError}
        </div>
      )}

      {/* ═══════════════════════════════════════
          STEP 1: DETAILS & EVIDENCE INSPECTION
      ═══════════════════════════════════════ */}
      {!successDisputeId && currentStep === 1 && (
        <div className="space-y-6">
          {/* Section: Select Order */}
          <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="select-order" className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                1. Select Target Order
              </label>
              {selectedOrder && (
                <span className="text-[11px] font-mono text-[#49B99A] capitalize">
                  Status: {selectedOrder.status}
                </span>
              )}
            </div>

            <select
              id="select-order"
              value={selectedOrderId || ""}
              onChange={(e) => handleSelectOrder(Number(e.target.value))}
              disabled={isLoadingOrders || orders.length === 0}
              className="w-full bg-[#0E0E10] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
            >
              {isLoadingOrders ? (
                <option value="">Loading customer orders...</option>
              ) : orders.length === 0 ? (
                <option value="">No eligible orders found</option>
              ) : (
                orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number || `#ORD-${o.id}`} — {o.product?.product_name || `Product #${o.product_id}`} (${o.status})
                  </option>
                ))
              )}
            </select>

            {selectedOrder && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#777777] block text-[10px]">ORDER VALUE:</span>
                  <span className="text-white font-medium">${selectedOrder.total_amount?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px]">ORDER ID:</span>
                  <span className="text-white font-medium">#{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px]">BUYER ID:</span>
                  <span className="text-white font-medium">User #{selectedOrder.buyer_id}</span>
                </div>
                <div>
                  <span className="text-[#777777] block text-[10px]">SELLER ID:</span>
                  <span className="text-white font-medium">User #{selectedOrder.seller_id}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Dispute Reason */}
          <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <label className="text-xs font-mono text-[#777777] uppercase tracking-wider block">
              2. Dispute Classification
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DISPUTE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedReason === reason
                      ? "bg-[#1E1E22] border-white/30 text-white shadow-sm"
                      : "bg-[#0E0E10] border-white/[0.06] text-[#A3A3A3] hover:text-white hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{reason}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedReason === reason
                          ? "border-[#3867FF] bg-[#3867FF]"
                          : "border-white/20"
                      }`}
                    >
                      {selectedReason === reason && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#777777]">
                    {reason === "Product returned damaged" && "Physical fractures, water damage, or burns."}
                    {reason === "Missing accessories" && "Cables, adapters, or components not returned."}
                    {reason === "Product identity mismatch" && "Returned item serial or model does not match dispatch."}
                    {reason === "Packaging issue" && "Retail box missing, destroyed, or tampered."}
                    {reason === "Incorrect return" && "Completely different item returned in error."}
                    {reason === "Other" && "Specific claim described in accompanying notes."}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Detailed Description */}
          <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="claim-description" className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                3. Detailed Claim Description
              </label>
              <span className="text-[11px] font-mono text-[#777777]">
                Minimum 10 characters ({description.trim().length})
              </span>
            </div>
            <textarea
              id="claim-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the exact discrepancy observed between the dispatch condition and return receipt (e.g. 'Customer returned device with shattered OLED screen and missing 65W charging brick...')"
              className="w-full bg-[#0E0E10] border border-white/[0.12] rounded-xl p-4 text-xs text-white placeholder-[#777777] focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          {/* Section: Relevant Evidence Vault Preview */}
          <div className="card-charcoal rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-[#777777] uppercase tracking-wider block">
                  4. Cryptographically Anchored Evidence
                </span>
                <p className="text-[11px] text-[#A3A3A3] mt-0.5">
                  The platform automatically anchors all dispatch & intake records for this order to the dispute dossier.
                </p>
              </div>
              {isLoadingEvidence && (
                <span className="text-[11px] font-mono text-[#3867FF] animate-pulse">
                  Querying sessions...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Session Box */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
                    Original Delivery Evidence
                  </span>
                  <span className="font-mono text-[10px] text-[#A3A3A3]">
                    {deliverySession ? `${deliverySession.files?.length || 0} file(s)` : "Not Captured"}
                  </span>
                </div>
                {deliverySession ? (
                  <div className="text-[11px] text-[#777777] space-y-1">
                    <div>Session ID: #{deliverySession.id} ({deliverySession.session_status})</div>
                    <div>
                      Condition Reports: {deliverySession.condition_reports?.length || 0} recorded
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#777777]">
                    No delivery evidence was captured for this order.
                  </p>
                )}
              </div>

              {/* Return Session Box */}
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
                    Customer Return Evidence
                  </span>
                  <span className="font-mono text-[10px] text-[#A3A3A3]">
                    {returnSession ? `${returnSession.files?.length || 0} file(s)` : "Not Captured"}
                  </span>
                </div>
                {returnSession ? (
                  <div className="text-[11px] text-[#777777] space-y-1">
                    <div>Session ID: #{returnSession.id} ({returnSession.session_status})</div>
                    <div>
                      Condition Reports: {returnSession.condition_reports?.length || 0} recorded
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#777777]">
                    No return evidence has been captured for this order yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/dashboard/disputes">
              <Button variant="outline" className="text-xs rounded-xl border-white/[0.1] text-white">
                Cancel
              </Button>
            </Link>
            <Button
              disabled={!isFormValid}
              onClick={() => setCurrentStep(2)}
              className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-6 py-2.5 text-xs font-medium rounded-xl"
            >
              Continue to Review →
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          STEP 2: PRE-SUBMISSION REVIEW
      ═══════════════════════════════════════ */}
      {!successDisputeId && currentStep === 2 && (
        <div className="space-y-6">
          <div className="card-charcoal rounded-2xl p-6 sm:p-8 border border-white/[0.08] space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Review Dispute Dossier Before Lodging
              </h2>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Please verify all claim parameters. Once submitted, an immutable dispute event will be anchored into the ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <span className="text-[#777777] font-mono block text-[10px] uppercase">TARGET ORDER</span>
                  <div className="text-white font-medium text-sm mt-0.5">
                    {selectedOrder?.order_number || `#ORD-${selectedOrderId}`}
                  </div>
                  <div className="text-[#A3A3A3] text-xs">
                    {selectedOrder?.product?.product_name} · ${selectedOrder?.total_amount?.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span className="text-[#777777] font-mono block text-[10px] uppercase">DISPUTE CLASSIFICATION</span>
                  <div className="text-[#D4A359] font-medium text-sm mt-0.5">
                    {selectedReason}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[#777777] font-mono block text-[10px] uppercase">EVIDENCE ATTACHMENTS</span>
                  <div className="text-white font-mono text-xs mt-1 space-y-1">
                    <div>
                      Delivery Session:{" "}
                      {deliverySession ? (
                        <span className="text-[#49B99A]">#{deliverySession.id} ({deliverySession.files?.length || 0} files)</span>
                      ) : (
                        <span className="text-[#777777]">None</span>
                      )}
                    </div>
                    <div>
                      Return Session:{" "}
                      {returnSession ? (
                        <span className="text-[#49B99A]">#{returnSession.id} ({returnSession.files?.length || 0} files)</span>
                      ) : (
                        <span className="text-[#777777]">None</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[#777777] font-mono block text-[10px] uppercase">STATUS LIFECYCLE</span>
                  <div className="text-xs text-[#A3A3A3] mt-1">
                    Will initiate in <span className="font-mono text-[#D4A359]">OPEN</span> state for counterparty and admin review.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06]">
              <span className="text-[#777777] font-mono block text-[10px] uppercase mb-1.5">
                CLAIMANT STATEMENT
              </span>
              <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="text-xs rounded-xl border-white/[0.1] text-white"
            >
              ← Back to Edit
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-8 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-[#3867FF]/20"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Latching Dispute with Server...</span>
                </>
              ) : (
                <span>Confirm & Submit Dispute</span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense
      fallback={
        <div className="card-charcoal rounded-2xl p-12 text-center text-sm font-mono text-[#777777]">
          Loading dispute submission interface...
        </div>
      }
    >
      <NewDisputeContent />
    </Suspense>
  );
}
