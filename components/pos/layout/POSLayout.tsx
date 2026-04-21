"use client";
import { useState } from "react";
import { POSHeader } from "./POSHeader";
import { POSMainPanel } from "./POSMainPanel";
import POSSidebar, { CartItem } from "./POSSidebar";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  image?: string;
  color?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
  productCount?: number;
}

export default function POSLayout() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories: Category[] = [
    { id: "drinks", name: "Drinks", productCount: 4 },
    { id: "snacks", name: "Snacks", productCount: 4 },
    { id: "instant", name: "Instant Food", productCount: 3 },
    { id: "dessert", name: "Desserts", productCount: 2 },
  ];

  const products: Product[] = [
    // ─── DRINKS ─────────────────────────────
    {
      id: "1",
      name: "Coca Cola",
      price: 25,
      category: "drinks",
      sku: "DRK-001",
      stock: 50,
    },
    {
      id: "2",
      name: "Sprite",
      price: 25,
      category: "drinks",
      sku: "DRK-002",
      stock: 45,
    },
    {
      id: "3",
      name: "Royal Orange",
      price: 25,
      category: "drinks",
      sku: "DRK-003",
      stock: 40,
    },
    {
      id: "4",
      name: "Mountain Dew",
      price: 30,
      category: "drinks",
      sku: "DRK-004",
      stock: 35,
    },
    {
      id: "5",
      name: "Pepsi",
      price: 25,
      category: "drinks",
      sku: "DRK-005",
      stock: 50,
    },
    {
      id: "6",
      name: "Iced Tea",
      price: 30,
      category: "drinks",
      sku: "DRK-006",
      stock: 30,
    },
    {
      id: "7",
      name: "Bottled Water",
      price: 15,
      category: "drinks",
      sku: "DRK-007",
      stock: 80,
    },
    {
      id: "8",
      name: "Gatorade Blue",
      price: 45,
      category: "drinks",
      sku: "DRK-008",
      stock: 25,
    },

    // ─── SNACKS ─────────────────────────────
    {
      id: "9",
      name: "Lays Classic",
      price: 35,
      category: "snacks",
      sku: "SNK-001",
      stock: 25,
    },
    {
      id: "10",
      name: "Doritos Nacho Cheese",
      price: 40,
      category: "snacks",
      sku: "SNK-002",
      stock: 20,
    },
    {
      id: "11",
      name: "Oreo Cookies",
      price: 20,
      category: "snacks",
      sku: "SNK-003",
      stock: 60,
    },
    {
      id: "12",
      name: "KitKat 2-Finger",
      price: 25,
      category: "snacks",
      sku: "SNK-004",
      stock: 35,
    },
    {
      id: "13",
      name: "Chippy BBQ",
      price: 18,
      category: "snacks",
      sku: "SNK-005",
      stock: 50,
    },
    {
      id: "14",
      name: "Nova Multigrain",
      price: 22,
      category: "snacks",
      sku: "SNK-006",
      stock: 45,
    },
    {
      id: "15",
      name: "Piattos Cheese",
      price: 20,
      category: "snacks",
      sku: "SNK-007",
      stock: 40,
    },
    {
      id: "16",
      name: "Cheez-It",
      price: 30,
      category: "snacks",
      sku: "SNK-008",
      stock: 25,
    },

    // ─── INSTANT FOOD ───────────────────────
    {
      id: "17",
      name: "Cup Noodles Beef",
      price: 45,
      category: "instant",
      sku: "INS-001",
      stock: 30,
    },
    {
      id: "18",
      name: "Lucky Me Pancit Canton Original",
      price: 20,
      category: "instant",
      sku: "INS-002",
      stock: 70,
    },
    {
      id: "19",
      name: "Lucky Me Pancit Canton Chilimansi",
      price: 20,
      category: "instant",
      sku: "INS-003",
      stock: 65,
    },
    {
      id: "20",
      name: "Nissin Ramen",
      price: 35,
      category: "instant",
      sku: "INS-004",
      stock: 40,
    },
    {
      id: "21",
      name: "Mi Goreng Indomie",
      price: 30,
      category: "instant",
      sku: "INS-005",
      stock: 55,
    },
    {
      id: "22",
      name: "Mac & Cheese Cup",
      price: 55,
      category: "instant",
      sku: "INS-006",
      stock: 15,
    },

    // ─── DESSERTS ───────────────────────────
    {
      id: "23",
      name: "Chocolate Cake Slice",
      price: 70,
      category: "dessert",
      sku: "DES-001",
      stock: 10,
    },
    {
      id: "24",
      name: "Vanilla Ice Cream Cone",
      price: 60,
      category: "dessert",
      sku: "DES-002",
      stock: 20,
    },
    {
      id: "25",
      name: "Strawberry Ice Cream",
      price: 60,
      category: "dessert",
      sku: "DES-003",
      stock: 18,
    },
    {
      id: "26",
      name: "Brownies Bite",
      price: 40,
      category: "dessert",
      sku: "DES-004",
      stock: 25,
    },
    {
      id: "27",
      name: "Donut Glazed",
      price: 30,
      category: "dessert",
      sku: "DES-005",
      stock: 35,
    },

    // ─── BASIC GOODS ────────────────────────
    {
      id: "28",
      name: "Instant Coffee 3-in-1",
      price: 12,
      category: "instant",
      sku: "BSC-001",
      stock: 100,
    },
    {
      id: "29",
      name: "Sugar Pack 1kg",
      price: 55,
      category: "instant",
      sku: "BSC-002",
      stock: 50,
    },
    {
      id: "30",
      name: "Cooking Oil 1L",
      price: 120,
      category: "instant",
      sku: "BSC-003",
      stock: 25,
    },
    {
      id: "31",
      name: "Rice 1kg",
      price: 60,
      category: "instant",
      sku: "BSC-004",
      stock: 80,
    },

    // ─── ADDITIONAL SNACK VARIETY ──────────
    {
      id: "32",
      name: "Cloud 9 Chocolate",
      price: 15,
      category: "snacks",
      sku: "SNK-009",
      stock: 60,
    },
    {
      id: "33",
      name: "Hansel Sandwich",
      price: 12,
      category: "snacks",
      sku: "SNK-010",
      stock: 70,
    },
    {
      id: "34",
      name: "Flat Tops Chocolate",
      price: 2,
      category: "snacks",
      sku: "SNK-011",
      stock: 200,
    },
    {
      id: "35",
      name: "White Rabbit Candy",
      price: 5,
      category: "snacks",
      sku: "SNK-012",
      stock: 150,
    },

    // ─── MORE DRINKS ────────────────────────
    {
      id: "36",
      name: "Red Bull Energy",
      price: 95,
      category: "drinks",
      sku: "DRK-009",
      stock: 20,
    },
    {
      id: "37",
      name: "C2 Green Tea",
      price: 20,
      category: "drinks",
      sku: "DRK-010",
      stock: 60,
    },
    {
      id: "38",
      name: "Minute Maid Juice",
      price: 35,
      category: "drinks",
      sku: "DRK-011",
      stock: 45,
    },
    {
      id: "39",
      name: "Wilkins Distilled Water",
      price: 20,
      category: "drinks",
      sku: "DRK-012",
      stock: 70,
    },
    {
      id: "40",
      name: "Pocari Sweat",
      price: 55,
      category: "drinks",
      sku: "DRK-013",
      stock: 30,
    },
  ];

  const handleProductSelect = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <POSHeader
        storeName="My Store"
        terminalId="POS-01"
        onLogout={() => console.log("Logout")}
      />

      {/* Main POS Workspace */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row min-w-0 min-h-0">
        {/* Product Browser */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <POSMainPanel
            products={products}
            categories={categories}
            onProductSelect={handleProductSelect}
          />
        </div>

        {/* Cart + Payment */}
        <div className="w-full lg:w-[420px] lg:min-w-[420px] border-t lg:border-t-0 lg:border-l bg-card">
          <POSSidebar
            cart={cart}
            onUpdateQuantity={(id, qty) =>
              setCart((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, quantity: qty } : item,
                ),
              )
            }
            onRemoveItem={(id) =>
              setCart((prev) => prev.filter((item) => item.id !== id))
            }
            onClearCart={() => setCart([])}
          />
        </div>
      </div>
    </div>
  );
}
