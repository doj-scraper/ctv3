"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  moq: number;
  stock: string;
  image: string;
  category: string;
  stockCount: number;
}

interface PartsApiProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  bucket: string;
}

const PRODUCT_IMAGE_BY_BUCKET: Record<string, string> = {
  'visual interface': '/images/product_screen.svg',
  'chassis & enclosure': '/images/product_power.svg',
  'functional modules': '/images/product_camera.svg',
  interconnects: '/images/product_charging.svg',
};

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Fetch real products from backend
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/parts?search=iPhone");
        const data: { success?: boolean; parts?: PartsApiProduct[] } = await response.json();

        if (data.success && data.parts) {
          const mappedProducts = data.parts.slice(0, 8).map((part) => {
            const bucketKey = part.bucket?.toLowerCase() ?? "";

            return {
              id: part.id,
              name: part.name,
              sku: part.sku,
              price: part.price ? `$${(part.price / 100).toFixed(2)}` : "Contact for Price",
              moq: 1,
              stock: part.stock > 0 ? (part.stock < 10 ? "Low Stock" : "In Stock") : "Out of Stock",
              stockCount: part.stock,
              image: PRODUCT_IMAGE_BY_BUCKET[bucketKey] ?? "/images/product_placeholder.svg",
              category: part.bucket || "Other",
            };
          });
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();

    return () => observer.disconnect();
  }, []);

  const filters = ["All", "Display", "Battery", "Camera", "Charging Port"];

  const filteredProducts =
    activeFilter === "All"
      ? products
      : products.filter((p) => p.category?.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <section ref={sectionRef} id="catalog" className="section-flowing py-20 lg:py-32" style={{ zIndex: 30 }}>
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div>
            <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-2">
              IN-DEMAND <span className="text-ct-accent">PARTS</span>
            </h2>
            <p className="text-ct-text-secondary text-sm lg:text-base">
              High-rotation components with clear MOQ and stock status.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-6 lg:mt-0">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-chip ${activeFilter === filter ? "active" : ""}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-ct-accent animate-spin" />
            <span className="ml-3 text-ct-text-secondary">Loading products...</span>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`product-card transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square bg-ct-bg-secondary/50 p-4 flex items-center justify-center relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-micro text-ct-text-secondary">{product.sku}</span>
                    <span
                      className={`badge ${
                        product.stockCount === 0
                          ? "bg-red-500/10 text-red-400"
                          : product.stockCount < 10
                          ? "bg-amber-400/10 text-amber-400"
                          : ""
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                  <h3 className="text-ct-text font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ct-accent font-semibold">{product.price}</span>
                    <span className="text-micro text-ct-text-secondary">MOQ: {product.moq}</span>
                  </div>
                  <Link
                    href={`/catalog?search=${encodeURIComponent(product.sku)}`}
                    className="w-full block text-center py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-ct-accent/30 text-ct-accent hover:bg-ct-accent/10"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-ct-text-secondary">
            <p>No products found for this category.</p>
            <button onClick={() => setActiveFilter("All")} className="text-ct-accent mt-2 hover:underline">
              Show all products
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/catalog" className="link-arrow inline-flex items-center gap-2">
            View full catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
