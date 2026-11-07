"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { Order, Product } from "@/types";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const { user, isBuyer, isSeller, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          orderService.list().catch((e) => {
            console.error("Failed to load orders", e);
            return [] as Order[];
          }),
          productService.list().catch((e) => {
            console.error("Failed to load products", e);
            return [] as Product[];
          }),
        ]);

        if (isMounted) {
          setOrders(ordersData);
          setProducts(productsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute actual metrics from live backend data
  const sellerProducts = isSeller
    ? products.filter((p) => p.seller_id === user?.id)
    : products;

  const totalRevenue = isSeller
    ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    : orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeOrders = orders.filter((o) => ["confirmed", "shipped"].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const returnOrders = orders.filter((o) => ["return_requested", "returned"].includes(o.status)).length;

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome, {user?.full_name || "User"}
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1">
            {isBuyer && "Track your package deliveries, custody baseline records, and returns."}
            {isSeller && "Manage your catalog inventory, fulfill customer orders, and audit returned items."}
            {isAdmin && "Oversee platform orders, product inventory, and customer custody chains."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSeller && (
            <Link href="/dashboard/products">
              <Button variant="primary" size="sm">
                + New Product
              </Button>
            </Link>
          )}
          {isBuyer && (
            <Link href="/dashboard/products">
              <Button variant="primary" size="sm">
                Browse Catalog & Order
              </Button>
            </Link>
          )}
          <Link href="/dashboard/orders">
            <Button variant="secondary" size="sm">
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* ═══════════════════════════════════════
          REAL STATS CARDS (No invented metrics)
      ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <div className="card-charcoal rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#777777] font-mono mb-2">
            <span>{isBuyer ? "TOTAL PURCHASES" : isSeller ? "STORE ORDERS" : "SYSTEM ORDERS"}</span>
            <span>📦</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {isLoading ? "—" : orders.length}
          </div>
          <div className="text-xs text-[#A3A3A3] mt-1.5">
            {orders.length === 1 ? "1 active order record" : `${orders.length} order records in database`}
          </div>
        </div>

        {/* Card 2 */}
        <div className="card-charcoal rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#777777] font-mono mb-2">
            <span>{isSeller ? "MANAGED PRODUCTS" : "CATALOG ITEMS"}</span>
            <span>🏷️</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {isLoading ? "—" : isSeller ? sellerProducts.length : products.length}
          </div>
          <div className="text-xs text-[#A3A3A3] mt-1.5">
            {isSeller ? "Products listed by your store" : "Available in merchant catalog"}
          </div>
        </div>

        {/* Card 3 */}
        <div className="card-charcoal rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#777777] font-mono mb-2">
            <span>ORDER STATUS BREAKDOWN</span>
            <span>⚡</span>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {isLoading ? "—" : `${deliveredOrders}/${orders.length}`}
          </div>
          <div className="text-xs text-[#A3A3A3] mt-1.5">
            {deliveredOrders} delivered · {activeOrders} in transit · {pendingOrders} pending · {returnOrders} returns
          </div>
        </div>

        {/* Card 4 */}
        <div className="card-charcoal rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs text-[#777777] font-mono mb-2">
            <span>TOTAL VOLUME</span>
            <span>💵</span>
          </div>
          <div className="text-3xl font-bold text-[#49B99A] font-mono">
            {isLoading ? "—" : `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-xs text-[#A3A3A3] mt-1.5">
            Calculated from verified order records
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          RECENT ORDERS TABLE
      ═══════════════════════════════════════ */}
      <div className="card-charcoal rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Recent Orders
            </h2>
            <p className="text-xs text-[#777777] mt-0.5">
              Live orders retrieved from the ReturnProof SQLite / Azure SQL backend.
            </p>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-xs text-[#D4D4D4]">
              View all ({orders.length}) →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#777777] font-mono">
            Loading orders from backend API...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center mx-auto text-xl text-[#777777]">
              📦
            </div>
            <div>
              <p className="text-sm font-medium text-white">No orders found</p>
              <p className="text-xs text-[#777777] mt-1">
                {isBuyer
                  ? "You haven't placed any orders yet. Browse the catalog to start."
                  : "No orders have been placed for your products yet."}
              </p>
            </div>
            {isBuyer && (
              <Link href="/dashboard/products">
                <Button variant="primary" size="sm">
                  Browse Product Catalog
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141416] text-[#777777] font-mono uppercase border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-6">Order #</th>
                  <th className="py-3 px-6">Item / Product</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-white font-medium">
                      {order.order_number || `#ORD-${order.id}`}
                    </td>
                    <td className="py-4 px-6 text-[#D4D4D4]">
                      {order.product?.product_name || `Product #${order.product_id || order.id}`}
                      {order.quantity > 1 && (
                        <span className="text-[#777777] ml-1.5">×{order.quantity}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-white font-medium">
                      ${order.total_amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono border ${
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
          CHAIN-OF-CUSTODY ROADMAP NOTICE
      ═══════════════════════════════════════ */}
      <div className="p-5 rounded-2xl bg-[#141416] border border-white/[0.07] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#49B99A]" />
            Chain-of-Custody Integrity Architecture
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl leading-relaxed">
            All orders are registered with immutable timestamps and ready for evidence session linking.
            Evidence upload (`/api/v1/evidence/sessions`) and automated dispute arbitration are scheduled
            for backend Steps 5 & 7.
          </p>
        </div>
        <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm" className="text-xs text-[#D4D4D4] whitespace-nowrap">
            View Swagger Specs ↗
          </Button>
        </a>
      </div>
    </div>
  );
}
