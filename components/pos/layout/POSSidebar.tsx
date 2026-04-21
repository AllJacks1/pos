"use client";

import React, { useState, useMemo } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Receipt,
  CreditCard,
  Banknote,
  Tag,
  Percent,
  ShoppingCart,
  X,
  ArrowRight,
  AlertCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  discount?: number; // flat discount per item
}

export interface OrderSummary {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  itemCount: number;
}

export type PaymentMethod = "cash" | "card" | "other";

export interface PaymentState {
  method: PaymentMethod;
  amountTendered: number;
  changeDue: number;
}

// ─────────────────────────────────────────────
// Mock Store (replace with Zustand in production)
// ─────────────────────────────────────────────

interface POSStore {
  cart: CartItem[];
  discountCode: string | null;
  discountPercent: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (code: string | null, percent: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountTendered: (amount: number) => void;
}

// ─────────────────────────────────────────────
// Utility Helpers
// ─────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const calculateOrderSummary = (
  cart: CartItem[],
  discountPercent: number,
): OrderSummary => {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * (item.price - (item.discount || 0)),
    0,
  );
  const taxRate = 0.08; // 8% tax — configurable in real app
  const taxAmount = subtotal * taxRate;
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    total,
    itemCount,
  };
};

// ─────────────────────────────────────────────
// Sub-Component: OrderCart
// ─────────────────────────────────────────────

interface OrderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function OrderCart({ cart, onUpdateQuantity, onRemove }: OrderCartProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-[#94A3B8]" strokeWidth={2} />
        </div>
        <p className="text-[#0F172A] font-medium text-base mb-1">
          Your cart is empty
        </p>
        <p className="text-[#64748B] text-sm">
          Add products to start a new order
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-4">
      <div className="space-y-3 py-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[#FFFFFF] border border-[#E2E8F0] rounded-[10px] p-2.5 sm:p-3 hover:border-[#2563EB]/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Product Image Placeholder */}
              <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-[#94A3B8]" strokeWidth={2} />
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-[#0F172A] font-medium text-sm leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[#64748B] text-xs mt-0.5">{item.sku}</p>
                  </div>
                  <span className="text-[#0F172A] font-semibold text-sm whitespace-nowrap">
                    {formatCurrency(
                      item.quantity * (item.price - (item.discount || 0)),
                    )}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.max(0, item.quantity - 1),
                        )
                      }
                      className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors disabled:opacity-40"
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[#0F172A]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Remove item</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────
// Sub-Component: OrderSummary
// ─────────────────────────────────────────────

interface OrderSummaryProps {
  summary: OrderSummary;
  discountCode: string | null;
  discountPercent: number;
  onApplyDiscount: (code: string) => void;
  onRemoveDiscount: () => void;
}

function OrderSummary({
  summary,
  discountCode,
  discountPercent,
  onApplyDiscount,
  onRemoveDiscount,
}: OrderSummaryProps) {
  const [codeInput, setCodeInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = () => {
    if (!codeInput.trim()) return;
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      onApplyDiscount(codeInput.trim());
      setIsApplying(false);
      setCodeInput("");
    }, 400);
  };

  return (
    <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-4 space-y-3">
      {/* Discount Input */}
      {!discountCode ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
              strokeWidth={2}
            />
            <Input
              placeholder="Discount code..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="pl-9 h-9 text-sm bg-[#FFFFFF] border-[#E2E8F0] rounded-lg focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB] placeholder:text-[#94A3B8]"
            />
          </div>
          <Button
            onClick={handleApply}
            disabled={!codeInput.trim() || isApplying}
            className="h-9 px-3 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] rounded-lg text-sm font-medium"
          >
            {isApplying ? "..." : "Apply"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2flex items-center justify-between bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
            <span className="text-sm font-medium text-[#2563EB]">
              {discountCode}
            </span>
            <Badge
              variant="secondary"
              className="bg-[#2563EB]/10 text-[#2563EB] text-xs font-medium border-0"
            >
              {discountPercent}% OFF
            </Badge>
          </div>
          <button
            onClick={onRemoveDiscount}
            className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
            aria-label="Remove discount"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Totals Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">
            Subtotal ({summary.itemCount} items)
          </span>
          <span className="text-[#0F172A] font-medium">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-[#64748B]">
            Tax ({(summary.taxRate * 100).toFixed(0)}%)
          </span>
          <span className="text-[#0F172A] font-medium">
            {formatCurrency(summary.taxAmount)}
          </span>
        </div>

        {summary.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#10B981] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" strokeWidth={2} />
              Discount
            </span>
            <span className="text-[#10B981] font-medium">
              -{formatCurrency(summary.discountAmount)}
            </span>
          </div>
        )}

        <Separator className="bg-[#E2E8F0] my-2" />

        <div className="flex justify-between items-baseline">
          <span className="text-[#0F172A] font-semibold text-base">Total</span>
          <span className="text-[#0F172A] font-bold text-xl tracking-tight">
            {formatCurrency(summary.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-Component: PaymentPanel
// ─────────────────────────────────────────────

interface PaymentPanelProps {
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountTenderedChange: (amount: number) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  disabled: boolean;
}

function PaymentPanel({
  total,
  paymentMethod,
  amountTendered,
  onPaymentMethodChange,
  onAmountTenderedChange,
  onCheckout,
  onClearCart,
  disabled,
}: PaymentPanelProps) {
  const changeDue = Math.max(0, amountTendered - total);
  const isExact = Math.abs(amountTendered - total) < 0.01;
  const isInsufficient = amountTendered < total && amountTendered > 0;

  const quickAmounts = useMemo(() => {
    const rounded = Math.ceil(total / 5) * 5;
    return [rounded, rounded + 5, rounded + 10, rounded + 20].filter(
      (a) => a >= total,
    );
  }, [total]);

  return (
    <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] px-4 py-4 space-y-4">
      {/* Payment Method Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2">
        {[
          { id: "cash" as PaymentMethod, label: "Cash", icon: Banknote },
          { id: "card" as PaymentMethod, label: "Card", icon: CreditCard },
          { id: "other" as PaymentMethod, label: "Other", icon: Receipt },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPaymentMethodChange(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border text-sm font-medium transition-all",
              paymentMethod === id
                ? "bg-[#2563EB]/5 border-[#2563EB] text-[#2563EB]"
                : "bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8] hover:text-[#0F172A]",
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Cash Tender Input (only for cash) */}
      {paymentMethod === "cash" && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">
            Amount Tendered
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm font-medium">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amountTendered || ""}
              onChange={(e) =>
                onAmountTenderedChange(parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              className="pl-7 h-11 text-lg font-semibold bg-[#F8FAFC] border-[#E2E8F0] rounded-lg focus-visible:ring-[#2563EB] focus-visible:ring-1 focus-visible:border-[#2563EB]"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => onAmountTenderedChange(amount)}
                className="px-3 py-1.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                {formatCurrency(amount)}
              </button>
            ))}
            <button
              onClick={() => onAmountTenderedChange(total)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isExact
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                  : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:border-[#10B981] hover:text-[#10B981]",
              )}
            >
              Exact
            </button>
          </div>

          {/* Change Due */}
          {amountTendered > 0 && (
            <div
              className={cn(
                "flex justify-between items-center px-3 py-2 rounded-lg text-sm",
                isInsufficient
                  ? "bg-[#EF4444]/5 text-[#EF4444]"
                  : "bg-[#10B981]/5 text-[#10B981]",
              )}
            >
              <span className="font-medium flex items-center gap-1.5">
                {isInsufficient ? (
                  <>
                    <AlertCircle className="w-4 h-4" strokeWidth={2} />
                    Insufficient
                  </>
                ) : (
                  "Change Due"
                )}
              </span>
              <span className="font-bold">
                {isInsufficient
                  ? formatCurrency(total - amountTendered)
                  : formatCurrency(changeDue)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
        <Button
          onClick={onCheckout}
          disabled={disabled || (paymentMethod === "cash" && isInsufficient)}
          className={cn(
            "h-12 rounded-lg text-base font-semibold transition-all",
            disabled
              ? "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
              : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm hover:shadow-md",
          )}
        >
          {disabled ? (
            "Add items to checkout"
          ) : (
            <span className="flex items-center gap-2">
              Charge {formatCurrency(total)}
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onClearCart}
          disabled={disabled}
          className="h-12 w-12 p-0 rounded-lg border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444]/30 hover:bg-[#EF4444]/5"
          aria-label="Clear cart"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component: POSSidebar
// ─────────────────────────────────────────────

export interface POSSidebarProps {
  cart?: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
  onApplyDiscount?: (code: string) => void;
  onRemoveDiscount?: () => void;
  onCheckout?: (payment: PaymentState) => void;
  className?: string;
}

export default function POSSidebar({
  cart: propCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyDiscount,
  onRemoveDiscount,
  onCheckout,
  className,
}: POSSidebarProps) {
  // Local state for standalone usage (replace with Zustand store)
  const [localCart, setLocalCart] = useState<CartItem[]>([
    // Demo data — remove in production
    {
      id: "1",
      name: "Wireless Mouse MX",
      sku: "WMX-2024",
      price: 49.99,
      quantity: 2,
      discount: 5.0,
    },
    {
      id: "2",
      name: "USB-C Hub Pro",
      sku: "UCH-500",
      price: 79.99,
      quantity: 1,
    },
  ]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountTendered, setAmountTendered] = useState(0);

  const cart = propCart ?? localCart;
  const isControlled = propCart !== undefined;

  const summary = calculateOrderSummary(cart, discountPercent);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (isControlled && onUpdateQuantity) {
      onUpdateQuantity(id, quantity);
      return;
    }
    setLocalCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleRemove = (id: string) => {
    if (isControlled && onRemoveItem) {
      onRemoveItem(id);
      return;
    }
    setLocalCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    if (isControlled && onClearCart) {
      onClearCart();
      return;
    }
    setLocalCart([]);
    setDiscountCode(null);
    setDiscountPercent(0);
    setAmountTendered(0);
  };

  const handleApplyDiscount = (code: string) => {
    if (isControlled && onApplyDiscount) {
      onApplyDiscount(code);
      return;
    }
    // Mock discount logic
    const mockDiscounts: Record<string, number> = {
      SAVE10: 10,
      WELCOME: 15,
      VIP20: 20,
    };
    setDiscountCode(code);
    setDiscountPercent(mockDiscounts[code.toUpperCase()] || 10);
  };

  const handleRemoveDiscount = () => {
    if (isControlled && onRemoveDiscount) {
      onRemoveDiscount();
      return;
    }
    setDiscountCode(null);
    setDiscountPercent(0);
  };

  const handleCheckout = () => {
    const payment: PaymentState = {
      method: paymentMethod,
      amountTendered,
      changeDue: Math.max(0, amountTendered - summary.total),
    };
    if (isControlled && onCheckout) {
      onCheckout(payment);
      return;
    }
    // Mock checkout
    alert(
      `Payment processed: ${formatCurrency(summary.total)} via ${paymentMethod}`,
    );
    handleClear();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-[#FFFFFF] border-t lg:border-t-0 lg:border-l border-[#E2E8F0] w-full lg:w-[420px] lg:min-w-[420px]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-[#2563EB]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[#0F172A] font-semibold text-sm leading-tight">
              Current Order
            </h2>
            <p className="text-[#64748B] text-xs">
              {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-[#64748B] hover:text-[#EF4444] font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable Middle Area */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Cart Items (scroll area takes full height) */}
        <div className="flex-1 min-h-0">
          <OrderCart
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        </div>
      </div>

      {/* Fixed Bottom Sections */}
      <OrderSummary
        summary={summary}
        discountCode={discountCode}
        discountPercent={discountPercent}
        onApplyDiscount={handleApplyDiscount}
        onRemoveDiscount={handleRemoveDiscount}
      />

      <PaymentPanel
        total={summary.total}
        paymentMethod={paymentMethod}
        amountTendered={amountTendered}
        onPaymentMethodChange={setPaymentMethod}
        onAmountTenderedChange={setAmountTendered}
        onCheckout={handleCheckout}
        onClearCart={handleClear}
        disabled={cart.length === 0}
      />
    </div>
  );
}
