import { Suspense } from "react";
import ProductCatalog from "@/app/products/ProductCatalog";
import { PRODUCTS } from "@/lib/marketing/products";

export default function ProductsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24">
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
          14 products. All delivered automatically.
        </h1>
        <p className="text-sm text-[#9c9890]">
          Browse the full catalog and filter by category. Every purchase routes
          through Whop and is delivered instantly.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6 text-sm text-[#9c9890]">
            Loading catalog…
          </div>
        }
      >
        <ProductCatalog products={PRODUCTS} />
      </Suspense>
    </div>
  );
}
