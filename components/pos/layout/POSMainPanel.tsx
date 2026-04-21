"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, Package, Tag, Grid3X3, ListFilter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  image?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
  productCount?: number;
}

interface POSMainPanelProps {
  products: Product[];
  categories: Category[];
  onProductSelect: (product: Product) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

// ─── Sub-Components ────────────────────────────────────────────────

function ProductSearch({
  value,
  onChange,
  placeholder = "Search products, SKU, or barcode...",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] transition-colors group-focus-within:text-[#2563EB]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 pr-10 h-11 bg-white border-[#E2E8F0]",
          "rounded-lg text-[15px] text-[#0F172A]",
          "placeholder:text-[#94A3B8]",
          "focus-visible:ring-2 focus-visible:ring-[#2563EB]/20 focus-visible:border-[#2563EB]",
          "transition-all duration-200",
          "shadow-sm hover:shadow-md",
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap",
              "transition-all duration-200 border",
              isActive
                ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A] hover:shadow-sm",
            )}
          >
            {cat.icon || <Tag className="h-4 w-4" />}
            <span>{cat.name}</span>
            {cat.productCount !== undefined && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-1 text-xs px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center",
                  isActive
                    ? "bg-white/20 text-white border-0"
                    : "bg-[#F1F5F9] text-[#64748B] border-0",
                )}
              >
                {cat.productCount}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const outOfStock = product.stock <= 0;

  return (
    <button
      onClick={onClick}
      disabled={outOfStock}
      className={cn(
        "group relative flex flex-col items-start p-3 sm:p-4 rounded-[10px] border bg-white",
        "transition-all duration-200",
        outOfStock
          ? "opacity-50 cursor-not-allowed border-[#E2E8F0]"
          : "border-[#E2E8F0] hover:border-[#2563EB]/30 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
      )}
    >
      {/* Image / Color Placeholder */}
      <div
        className={cn(
          "w-full aspect-square rounded-lg mb-3 flex items-center justify-center",
          "bg-[#F8FAFC] group-hover:bg-[#EFF6FF] transition-colors",
        )}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        ) : (
          <Package className="h-10 w-10 text-[#CBD5E1] group-hover:text-[#2563EB]/40 transition-colors" />
        )}
      </div>

      {/* Product Info */}
      <div className="w-full text-left space-y-1.5">
        <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-lg font-bold text-[#2563EB]">
            ${product.price.toFixed(2)}
          </span>
          {outOfStock ? (
            <Badge
              variant="outline"
              className="text-[#EF4444] border-[#EF4444]/20 bg-[#EF4444]/5 text-xs"
            >
              Out of stock
            </Badge>
          ) : product.stock < 5 ? (
            <Badge
              variant="outline"
              className="text-[#F59E0B] border-[#F59E0B]/20 bg-[#F59E0B]/5 text-xs"
            >
              {product.stock} left
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <span className="font-mono bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#64748B]">
            {product.sku}
          </span>
        </div>
      </div>

      {/* Quick-add indicator on hover */}
      {!outOfStock && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#2563EB] text-white rounded-full p-1.5 shadow-lg">
            <Grid3X3 className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
    </button>
  );
}

function ProductGrid({
  products,
  onProductSelect,
  searchQuery,
}: {
  products: Product[];
  onProductSelect: (p: Product) => void;
  searchQuery: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-[#CBD5E1]" />
        </div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
          No products found
        </h3>
        <p className="text-sm text-[#64748B] max-w-xs">
          {searchQuery
            ? `No results for "${searchQuery}". Try a different search term or check your spelling.`
            : "This category is empty. Add products to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductSelect(product)}
        />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export function POSMainPanel({
  products,
  categories,
  onProductSelect,
  onSearch,
  className,
}: POSMainPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.id || "all",
  );

  // Filter products based on search + category
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, activeCategory, searchQuery]);

  const handleSearch = useCallback(
    (val: string) => {
      setSearchQuery(val);
      onSearch?.(val);
    },
    [onSearch],
  );

  // Prepend "All" category if not present
  const allCategories = useMemo(() => {
    const hasAll = categories.some((c) => c.id === "all");
    if (hasAll) return categories;
    return [
      {
        id: "all",
        name: "All Products",
        icon: <Grid3X3 className="h-5 w-5" />,
        productCount: products.length,
      },
      ...categories,
    ];
  }, [categories, products.length]);

  return (
    <div
      className={cn(
        "flex flex-col h-full min-w-0 min-h-0 bg-[#F8FAFC] rounded-[10px] border border-[#E2E8F0]",
        "shadow-sm overflow-hidden",
        className,
      )}
    >
      {/* Header Section */}
      <div className="p-3 sm:p-4 lg:p-5 pb-4 space-y-4 bg-white border-b border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#0F172A] tracking-tight">
              Products
            </h2>
            <p className="text-sm text-[#64748B] mt-0.5">
              {filteredProducts.length} item
              {filteredProducts.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {/* View toggle / filter button (extensibility) */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1]"
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <ProductSearch value={searchQuery} onChange={handleSearch} />
        <CategoryTabs
          categories={allCategories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Product Grid Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 p-3 sm:p-4 lg:p-5">
        <ProductGrid
          products={filteredProducts}
          onProductSelect={onProductSelect}
          searchQuery={searchQuery}
        />
      </ScrollArea>
    </div>
  );
}
