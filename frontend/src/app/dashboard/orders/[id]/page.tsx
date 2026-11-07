"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { EvidenceWorkspace } from "@/components/evidence/evidence-workspace";

function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);
  const { user, isBuyer, isSeller, isAdmin } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Transition form state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  // Tracking update state
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    let active = true;
    if (orderId) {
      orderService.getById(orderId).then((data) => {
        if (!active) return;
        setOrder(data);
        setTrackingNumber(data.tracking_number || "");
        if (data.delivery_date) {
          setDeliveryDate(data.delivery_date.split("T")[0]);
        }
        setIsLoading(false);
      }).catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load order details.");
        setIsLoading(false);
      });
    }
    return () => {
      active = false;
    };
  }, [orderId]);

  // Status transitions allowed based on role and current status
  const availableTransitions = React.useMemo(() => {
    if (!order) return [];

    if (isAdmin) {
      return ["pending", "confirmed", "shipped", "delivered", "return_requested", "returned", "cancelled"] as OrderStatus[];
    }

    if (isSeller) {
      const allowed: OrderStatus[] = [];
      if (order.status === "pending") allowed.push("confirmed", "shipped");
      if (order.status === "confirmed") allowed.push("shipped");
      if (order.status === "shipped") allowed.push("delivered");
      if (order.status === "return_requested") allowed.push("returned");
      return allowed;
    }

    if (isBuyer) {
      const allowed: OrderStatus[] = [];
      if (order.status === "pending") allowed.push("cancelled");
      if (order.status === "delivered") allowed.push("return_requested");
      return allowed;
    }

    return [];
  }, [order, isBuyer, isSeller, isAdmin]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setUpdatingStatus(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await orderService.updateStatus(orderId, selectedStatus as OrderStatus);
      setOrder(updated);
      setSelectedStatus("");
      setSuccessMessage(`Order status successfully updated to "${updated.status}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTrackingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingTracking(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await orderService.update(orderId, {
        tracking_number: trackingNumber.trim() || null,
        delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null,
      });
      setOrder(updated);
      setSuccessMessage("Shipping and delivery details updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tracking details.");
    } finally {
      setUpdatingTracking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-[#777777] font-mono">
        Loading order #{orderId} details from backend...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="space-y-4 max-w-lg mx-auto py-12 text-center">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
          {error}
        </div>
        <Link href="/dashboard/orders">
          <Button variant="secondary" size="sm">
            ← Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777] mb-1">
            <Link href="/dashboard/orders" className="hover:text-white transition-colors">
              ORDERS
            </Link>
            <span>/</span>
            <span className="text-white">{order.order_number || `#ORD-${order.id}`}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>{order.order_number || `Order #${order.id}`}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                order.status === "delivered"
                  ? "bg-[#49B99A]/10 border-[#49B99A]/30 text-[#49B99A]"
                  : order.status === "shipped"
                  ? "bg-white/[0.08] border-white/20 text-[#D4D4D4]"
                  : order.status === "confirmed"
                  ? "bg-white/[0.06] border-white/15 text-white"
                  : order.status === "return_requested" || order.status === "returned"
                  ? "bg-[#D4A359]/10 border-[#D4A359]/25 text-[#D4A359]"
                  : order.status === "cancelled"
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                  : "bg-[#1A1A1A] border-white/[0.08] text-[#A3A3A3]"
              }`}
            >
              ● {order.status}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/dashboard/verification?order_id=${order.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-[#3867FF]/30 text-[#88A8FF] hover:bg-[#3867FF]/10">
              AI Verification →
            </Button>
          </Link>
          <Link href={`/dashboard/disputes/new?order_id=${order.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-[#D4A359]/30 text-[#D4A359] hover:bg-[#D4A359]/10">
              File Dispute
            </Button>
          </Link>
          <Link href={`/dashboard/reports?order_id=${order.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-white/[0.1] text-white hover:bg-white/[0.08]">
              PDF Report
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="secondary" size="sm" className="text-xs">
              ← Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#49B99A]/10 border border-[#49B99A]/30 text-[#49B99A] text-xs sm:text-sm flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Main Grid: Details (Left) + Actions & Lifecycle (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Order Info, Product, Parties */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product & Financials Card */}
          <div className="card-charcoal rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Product & Financial Specification
            </h2>

            <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-2">
              <div className="text-base font-semibold text-white">
                {order.product?.product_name || `Product ID: ${order.product_id}`}
              </div>
              {order.product?.description && (
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  {order.product.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-[#777777]">
                {order.product?.sku && <span>SKU: {order.product.sku}</span>}
                {order.product?.brand && <span>Brand: {order.product.brand}</span>}
                {order.product?.serial_number && <span>SN: {order.product.serial_number}</span>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/[0.06] text-xs">
              <div>
                <span className="text-[#777777] block">Unit Price</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  ${order.product?.price ? order.product.price.toFixed(2) : (order.total_amount / (order.quantity || 1)).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#777777] block">Ordered Quantity</span>
                <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                  {order.quantity} unit{order.quantity > 1 ? "s" : ""}
                </span>
              </div>
              <div>
                <span className="text-[#777777] block">Total Amount</span>
                <span className="text-sm font-semibold text-[#49B99A] font-mono mt-0.5 block">
                  ${order.total_amount?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* Parties & Logistics Card */}
          <div className="card-charcoal rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Transaction Parties & Fulfillment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-1">
                <span className="text-[11px] font-mono text-[#777777] uppercase">Buyer Account</span>
                <div className="text-sm font-medium text-white">{order.buyer?.full_name || `Buyer #${order.buyer_id}`}</div>
                <div className="text-xs text-[#A3A3A3] font-mono">{order.buyer?.email || "—"}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] space-y-1">
                <span className="text-[11px] font-mono text-[#777777] uppercase">Seller / Merchant</span>
                <div className="text-sm font-medium text-white">{order.seller?.full_name || `Seller #${order.seller_id}`}</div>
                <div className="text-xs text-[#A3A3A3] font-mono">{order.seller?.email || "—"}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="flex justify-between text-[#777777]">
                <span>Carrier Tracking Code:</span>
                <span className="text-white font-mono">{order.tracking_number || "Not assigned yet"}</span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>Estimated Delivery Date:</span>
                <span className="text-white font-mono">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "Pending carrier dispatch"}
                </span>
              </div>
              <div className="flex justify-between text-[#777777]">
                <span>Order Placement Date:</span>
                <span className="text-white font-mono">
                  {new Date(order.created_at || order.order_date || "").toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Lifecycle Transitions & Status Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Lifecycle Transition Card */}
          <div className="card-charcoal rounded-2xl p-6 sm:p-7 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Status State Machine
            </h2>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Transition this order through its chain-of-custody lifecycle according to verified role permissions.
            </p>

            {availableTransitions.length > 0 ? (
              <form onSubmit={handleStatusChange} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-2">
                    Available State Transitions
                  </label>
                  <select
                    required
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    className="w-full h-11 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="">-- Select next status --</option>
                    {availableTransitions.map((st) => (
                      <option key={st} value={st}>
                        Transition to: {st.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={updatingStatus}
                  className="w-full font-semibold"
                >
                  Commit Status Transition
                </Button>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.06] text-xs text-[#777777]">
                No further status transitions are permissible for your current role ({user?.role}) from the &quot;{order.status}&quot; state.
              </div>
            )}
          </div>

          {/* Tracking & Logistics Update (Seller or Admin) */}
          {(isSeller || isAdmin) && (
            <div className="card-charcoal rounded-2xl p-6 sm:p-7 space-y-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Logistics & Tracking
              </h2>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Update the shipping carrier tracking code and target delivery schedule.
              </p>

              <form onSubmit={handleTrackingUpdate} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="TRK-FEDEX-998811"
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] mb-1.5">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  isLoading={updatingTracking}
                  className="w-full mt-2"
                >
                  Save Logistics Details
                </Button>
              </form>
            </div>
          )}

          {/* Evidence Session Status Box */}
          <div className="p-5 rounded-2xl bg-[#141416] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Chain-of-Custody Evidence</span>
              <span className="text-[10px] font-mono text-[#D4D4D4] bg-white/[0.06] px-2 py-0.5 rounded">
                SHA-256 Ready
              </span>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">
              Order #{order.id} is registered in the immutable ledger. When carrier transit and unboxing evidence sessions
              are captured, SHA-256 hashes are anchored to this order ID.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          IMMUTABLE EVIDENCE CAPTURE & CUSTODY WORKSPACE
      ═══════════════════════════════════════ */}
      <EvidenceWorkspace order={order} />
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-xs text-[#777777] font-mono">
          Loading order details...
        </div>
      }
    >
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
