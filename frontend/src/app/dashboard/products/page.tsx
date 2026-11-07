"use client";

import React, { useEffect, useState, useMemo } from "react";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { Product, ProductCreateRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function ProductsPage() {
  const { user, isSeller, isAdmin, isBuyer } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & category filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<ProductCreateRequest>({
    product_name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    price: 0,
    serial_number: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductCreateRequest>({
    product_name: "",
    description: "",
    sku: "",
    category: "",
    brand: "",
    price: 0,
    serial_number: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buyer Quick Order State
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderTracking, setOrderTracking] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.list();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product catalog.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    productService.list()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load product catalog.");
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Filter products:
  // If seller, show products where seller_id is their own (or allow toggling all)
  const displayProducts = useMemo(() => {
    return products.filter((p) => {
      // In Seller mode: only show products owned by this seller
      if (isSeller && p.seller_id !== user?.id) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.product_name?.toLowerCase().includes(query);
        const matchesSku = p.sku?.toLowerCase().includes(query);
        const matchesBrand = p.brand?.toLowerCase().includes(query);
        return Boolean(matchesName || matchesSku || matchesBrand);
      }

      return true;
    });
  }, [products, isSeller, user?.id, categoryFilter, searchQuery]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Handle Create Product
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.product_name.trim()) {
      setCreateError("Product title is required.");
      return;
    }
    if (createForm.price < 0) {
      setCreateError("Price must be a positive number.");
      return;
    }

    setIsSubmittingCreate(true);
    setCreateError(null);
    try {
      await productService.create({
        ...createForm,
        price: Number(createForm.price),
        seller_id: isSeller ? user?.id : undefined,
      });
      setShowCreateModal(false);
      setCreateForm({
        product_name: "",
        description: "",
        sku: "",
        category: "",
        brand: "",
        price: 0,
        serial_number: "",
      });
      setSuccessMessage("Product created successfully in the catalog.");
      await fetchProducts();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      product_name: product.product_name,
      description: product.description || "",
      sku: product.sku || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price,
      serial_number: product.serial_number || "",
    });
    setEditError(null);
  };

  // Handle Update Product
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmittingEdit(true);
    setEditError(null);
    try {
      await productService.update(editingProduct.id, {
        ...editForm,
        price: Number(editForm.price),
      });
      setEditingProduct(null);
      setSuccessMessage(`Product "${editForm.product_name}" updated successfully.`);
      await fetchProducts();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId: number) => {
    setIsDeleting(true);
    setError(null);
    try {
      await productService.delete(productId);
      setDeletingProductId(null);
      setSuccessMessage("Product removed from catalog.");
      await fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product. It may be linked to active customer orders."
      );
      setDeletingProductId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Buyer Order Placement
  const handleBuyerOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderingProduct) return;

    setIsPlacingOrder(true);
    setOrderError(null);
    try {
      await orderService.create({
        product_id: orderingProduct.id,
        seller_id: orderingProduct.seller_id || undefined,
        quantity: orderQuantity,
        total_amount: orderingProduct.price * orderQuantity,
        tracking_number: orderTracking.trim() || `TRK-UPS-${Math.floor(100000 + Math.random() * 900000)}`,
      });
      setOrderingProduct(null);
      setOrderQuantity(1);
      setOrderTracking("");
      setSuccessMessage(`Order for "${orderingProduct.product_name}" placed successfully! View in your Orders tab.`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isSeller ? "Inventory & Products" : isAdmin ? "Product Master Catalog" : "Product Catalog"}
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1">
            {isSeller
              ? "Create, update, and manage your product listings and serialized inventories."
              : isBuyer
              ? "Browse available merchant products and place verifiable orders."
              : "Review and administer all products published across the platform."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchProducts}
            className="text-xs"
          >
            ↻ Refresh
          </Button>

          {(isSeller || isAdmin) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="text-xs font-semibold"
            >
              + Create Product
            </Button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#49B99A]/10 border border-[#49B99A]/30 text-[#49B99A] text-xs sm:text-sm flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-sm hover:opacity-75">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm hover:opacity-75">✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === "ALL"
                ? "bg-white text-[#0a0a0a]"
                : "bg-[#141416] text-[#A3A3A3] hover:text-white border border-white/[0.06]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-white text-[#0a0a0a]"
                  : "bg-[#141416] text-[#A3A3A3] hover:text-white border border-white/[0.06]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, SKU, brand..."
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

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-16 text-center text-xs text-[#777777] font-mono">
            Loading products from FastAPI catalog...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="col-span-full card-charcoal rounded-2xl p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-center mx-auto text-xl text-[#777777]">
              🏷️
            </div>
            <div>
              <p className="text-sm font-medium text-white">No products found</p>
              <p className="text-xs text-[#777777] mt-1">
                {isSeller
                  ? "You haven't added any products yet. Click 'Create Product' to list your first item."
                  : "No products match your current search or category filter."}
              </p>
            </div>
            {(isSeller || isAdmin) && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                + Create First Product
              </Button>
            )}
          </div>
        ) : (
          displayProducts.map((product) => {
            const canManage = isAdmin || (isSeller && product.seller_id === user?.id);
            return (
              <div
                key={product.id}
                className="card-charcoal rounded-2xl p-6 flex flex-col justify-between group hover:border-white/20 transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/[0.06] text-[#A3A3A3] border border-white/[0.08]">
                      {product.category || "General"}
                    </span>
                    <span className="text-lg font-bold font-mono text-white">
                      ${product.price?.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-zinc-200">
                      {product.product_name}
                    </h3>
                    {product.brand && (
                      <span className="text-xs text-[#777777] font-medium block mt-0.5">
                        Brand: {product.brand}
                      </span>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-[#A3A3A3] leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="p-3 rounded-xl bg-[#141416] border border-white/[0.06] font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-[#777777]">
                      <span>SKU:</span>
                      <span className="text-white">{product.sku || "N/A"}</span>
                    </div>
                    {product.serial_number && (
                      <div className="flex justify-between text-[#777777]">
                        <span>Serial:</span>
                        <span className="text-[#D4D4D4]">{product.serial_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  {canManage ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(product)}
                        className="text-xs h-8 px-3"
                      >
                        Edit Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingProductId(product.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 h-8 px-3"
                      >
                        Delete
                      </Button>
                    </>
                  ) : isBuyer ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setOrderError(null);
                        setOrderingProduct(product);
                      }}
                      className="w-full text-xs font-semibold h-9"
                    >
                      Order Item (${product.price?.toFixed(2)})
                    </Button>
                  ) : (
                    <span className="text-xs text-[#777777] italic">
                      Listed by Seller #{product.seller_id}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ═══════════════════════════════════════
          CREATE PRODUCT MODAL
      ═══════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="card-charcoal rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h2 className="text-lg font-bold text-white">Create New Product</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#777777] hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony Alpha A7 IV"
                  value={createForm.product_name}
                  onChange={(e) => setCreateForm({ ...createForm, product_name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="2498.00"
                    value={createForm.price || ""}
                    onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SONY-A7IV-BODY"
                    value={createForm.sku || ""}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cameras"
                    value={createForm.category || ""}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    value={createForm.brand || ""}
                    onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Hardware Serial Number or IMEI
                </label>
                <input
                  type="text"
                  placeholder="e.g. SN-SONY-112233"
                  value={createForm.serial_number || ""}
                  onChange={(e) => setCreateForm({ ...createForm, serial_number: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed description of item condition, specifications, and package contents..."
                  value={createForm.description || ""}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingCreate}
                >
                  Publish to Catalog
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          EDIT PRODUCT MODAL
      ═══════════════════════════════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="card-charcoal rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <h2 className="text-lg font-bold text-white">Edit Product #{editingProduct.id}</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#777777] hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.product_name}
                  onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editForm.sku || ""}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editForm.category || ""}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editForm.brand || ""}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Hardware Serial Number or IMEI
                </label>
                <input
                  type="text"
                  value={editForm.serial_number || ""}
                  onChange={(e) => setEditForm({ ...editForm, serial_number: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingEdit}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ═══════════════════════════════════════ */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="card-charcoal rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Are you sure you want to delete this product from your inventory?
              This action cannot be undone. If orders exist for this item, the backend will prevent deletion.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingProductId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-500 text-white border-rose-500"
                isLoading={isDeleting}
                onClick={() => handleDeleteProduct(deletingProductId)}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          BUYER PLACE ORDER MODAL
      ═══════════════════════════════════════ */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="card-charcoal rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Order: {orderingProduct.product_name}</h3>
              <button
                onClick={() => setOrderingProduct(null)}
                className="text-[#777777] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {orderError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                {orderError}
              </div>
            )}

            <form onSubmit={handleBuyerOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D4D4D4] uppercase tracking-wider mb-1.5">
                  Carrier Tracking Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRK-UPS-774411"
                  value={orderTracking}
                  onChange={(e) => setOrderTracking(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#141416] border border-white/[0.09] text-white text-xs placeholder:text-[#666666] focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#141416] border border-white/[0.06] text-xs space-y-1">
                <div className="flex justify-between text-[#777777]">
                  <span>Item Price:</span>
                  <span className="text-white font-mono">${orderingProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Quantity:</span>
                  <span className="text-white font-mono">×{orderQuantity}</span>
                </div>
                <div className="flex justify-between text-white font-semibold pt-1 border-t border-white/[0.06]">
                  <span>Total Payable:</span>
                  <span className="text-[#49B99A] font-mono">
                    ${(orderingProduct.price * orderQuantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOrderingProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPlacingOrder}
                >
                  Confirm Purchase
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
