"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { Order, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function OrdersPage() {
  const { isBuyer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Quick Order Modal state (for buyers to place an order)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderTracking, setOrderTracking] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderModalError, setOrderModalError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [orderList, productList] = await Promise.all([
        orderService.list(),
        productService.list().catch(() => [] as Product[]),
      ]);
      setOrders(orderList);
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      orderService.list(),
      productService.list().catch(() => [] as Product[]),
    ])
      .then(([orderList, productList]) => {
        if (!active) return;
        setOrders(orderList);
        setProducts(productList);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "ALL" && order.status.toUpperCase() !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = order.order_number?.toLowerCase().includes(query);
        const matchesProduct = order.product?.product_name?.toLowerCase().includes(query);
        const matchesTracking = order.tracking_number?.toLowerCase().includes(query);
        return Boolean(matchesNumber || matchesProduct || matchesTracking);
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Handle Placing a New Order (for Buyers & Admins)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setOrderModalError("Please select a product to order.");
      return;
    }
    const product = products.find((p) => p.id === Number(selectedProductId));
    if (!product) {
      setOrderModalError("Selected product not found.");
      return;
    }

    setIsPlacingOrder(true);
    setOrderModalError(null);
    try {
      await orderService.create({
        product_id: product.id,
        seller_id: product.seller_id || undefined,
        quantity: orderQuantity,
        total_amount: product.price * orderQuantity,
        tracking_number: orderTracking.trim() || `TRK-FEDEX-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setShowOrderModal(false);
      setSelectedProductId("");
      setOrderQuantity(1);
      setOrderTracking("");
      await fetchOrders();
    } catch (err) {
      setOrderModalError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const statusTabs = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Return Requested", value: "RETURN_REQUESTED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Order Management
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1">
            {isBuyer
              ? "All your verified purchases, custody states, and return requests."
              : "Review incoming customer orders, manage fulfillments, and track returns."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchOrders}
            className="text-xs"
          >
            ↻ Refresh
          </Button>

          {isBuyer && products.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowOrderModal(true)}
              className="text-xs font-semibold"
            >
              + Place New Order
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? "bg-white text-[#0a0a0a] shadow-sm"
                  : "bg-[#141416] text-[#A3A3A3] hover:text-white border border-white/[0.06]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, product, tracking..."
            className="w-full h-10 px-3 pl-9 rounded-xl bg-[#141416] border border-white/[0.08] text-xs text-white placeholder:text-[#666666] focus:outline-none focus:border-white/30"
          />
          <svg
            className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-charcoal rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-16 text-center text-xs text-[#777777] font-mono">
            Loading order records from FastAPI backend...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center mx-auto text-xl text-[#777777]">
              📦
            </div>
            <div>
              <p className="text-sm font-medium text-white">No matching orders found</p>
              <p className="text-xs text-[#777777] mt-1">
                {orders.length === 0
                  ? "No orders have been recorded in the database yet."
                  : "Try clearing your search or status filter to view orders."}
              </p>
            </div>
            {isBuyer && products.length > 0 && orders.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowOrderModal(true)}
              >
                Place Your First Order
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141416] text-[#777777] font-mono uppercase border-b border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-6">Order ID / Number</th>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-6">Qty & Total</th>
                  <th className="py-3.5 px-6">Lifecycle Status</th>
                  <th className="py-3.5 px-6">Carrier Tracking</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-white">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="hover:underline text-[#F5F5F5]"
                      >
                        {order.order_number || `#ORD-${order.id}`}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">
                        {order.product?.product_name || `Product #${order.product_id}`}
                      </div>
                      {order.product?.sku && (
                        <div className="text-[11px] text-[#777777] font-mono mt-0.5">
                          SKU: {order.product.sku}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-white">
                      <div>${order.total_amount?.toFixed(2) || "0.00"}</div>
                      <div className="text-[11px] text-[#777777]">Qty: {order.quantity}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono border ${
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
                    </td>
                    <td className="py-4 px-6 font-mono text-[#A3A3A3]">
                      {order.tracking_number ? (
                        <span>{order.tracking_number}</span>
                      ) : (
                        <span className="text-[#666666] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-[#777777] font-mono">
                      {new Date(order.created_at || order.order_date || "").toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="secondary" size="sm" className="h-8 px-3 text-xs">
                          Inspect →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          BUYER PLACE ORDER MODAL
      ═══════════════════════════════════════ */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="card-charcoal rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h2 className="text-lg font-bold text-white">Place New Order</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-[#777777] hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {orderModalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {orderModalError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-2">
                  Select Product
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-11 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                >
                  <option value="">-- Choose from available catalog items --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} — ${p.price?.toFixed(2)} (SKU: {p.sku || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-11 px-4 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-2">
                  Carrier Tracking Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRK-FEDEX-998811"
                  value={orderTracking}
                  onChange={(e) => setOrderTracking(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs placeholder:text-[#666666] focus:outline-none focus:border-white/30"
                />
              </div>

              {selectedProductId && (
                <div className="p-3 rounded-xl bg-[#141416] border border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between text-[#777777]">
                    <span>Item Price:</span>
                    <span className="text-white font-mono">
                      ${products.find((p) => p.id === Number(selectedProductId))?.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#777777]">
                    <span>Quantity:</span>
                    <span className="text-white font-mono">×{orderQuantity}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-1 border-t border-white/[0.06]">
                    <span>Total Order Cost:</span>
                    <span className="text-[#49B99A] font-mono">
                      ${((products.find((p) => p.id === Number(selectedProductId))?.price || 0) * orderQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPlacingOrder}
                >
                  Confirm & Place Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
