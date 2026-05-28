"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CATEGORY_LABELS,
  Product,
  ProductCategory,
  formatPrice,
  getBadgeClasses,
  getDeliveryNote,
  getProductBySlug,
} from "@/lib/marketing/products";

type FilterKey = "all" | ProductCategory;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "ai-agents", label: "AI Agents" },
  { key: "devops", label: "DevOps" },
  { key: "automation", label: "Automation" },
  { key: "saas", label: "SaaS" },
  { key: "bundles", label: "Bundles" },
  { key: "community", label: "Community" },
];

export default function ProductCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const initialFilter: FilterKey = FILTERS.some(
    (filter) => filter.key === filterParam,
  )
    ? (filterParam as FilterKey)
    : "all";
  const [activeFilter, setActiveFilter] = useState<FilterKey>(initialFilter);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((product) => product.category === activeFilter);
  }, [activeFilter, products]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                isActive
                  ? "border-[#4f98a3] bg-[#4f98a3] text-white"
                  : "border-[#2e2d2a] text-[#9c9890] hover:text-[#e8e5de]"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => {
          const includes = product.bundleIncludes?.map((slug) => {
            const included = getProductBySlug(slug);
            return included?.name ?? slug;
          });

          return (
            <div
              key={product.slug}
              className="relative flex h-full flex-col rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6"
            >
              <span
                className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                  product.badge,
                )}`}
              >
                {product.badge}
              </span>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b6861]">
                {CATEGORY_LABELS[product.category]}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[#e8e5de]">
                {product.name}
              </h3>
              <p className="mt-3 text-sm text-[#9c9890]">
                {product.description}
              </p>
              {includes?.length ? (
                <div className="mt-4 text-xs text-[#9c9890]">
                  Includes: {includes.join(", ")}
                </div>
              ) : null}
              <div className="mt-6 font-mono text-2xl text-[#4f98a3]">
                {formatPrice(product.price)}
              </div>
              <a
                href={product.whopUrl}
                className="mt-6 flex h-12 items-center justify-center rounded-lg bg-[#4f98a3] text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
              >
                Buy on Whop →
              </a>
              <div className="mt-3 text-xs text-[#9c9890]">
                {getDeliveryNote(product.type)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
