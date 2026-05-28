import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Mail, ShoppingCart, Zap } from "lucide-react";
import {
  PRODUCT_DETAILS,
  PRODUCTS,
  formatPrice,
  getBadgeClasses,
  getBundleValue,
  getProductBySlug,
} from "@/lib/marketing/products";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const details = PRODUCT_DETAILS[product.slug];
  if (!details) {
    notFound();
  }
  const bundleValue = getBundleValue(product.slug);
  const bundleSavings = bundleValue
    ? {
        amount: bundleValue - product.price,
        percent: Math.round((1 - product.price / bundleValue) * 100),
      }
    : null;
  const bundleItems = product.bundleIncludes?.map((includeSlug) =>
    getProductBySlug(includeSlug),
  );
  const isIntake =
    product.type === "intake" || product.type === "subscription-intake";
  const isBundle = product.type === "bundle";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="grid gap-12 lg:grid-cols-[7fr_5fr]">
        <div className="space-y-10">
          <nav className="text-xs uppercase tracking-[0.2em] text-[#6b6861]">
            <Link href="/" className="hover:text-[#e8e5de]">
              Home
            </Link>{" "}
            &gt;{" "}
            <Link href="/products" className="hover:text-[#e8e5de]">
              Products
            </Link>{" "}
            &gt; <span className="text-[#e8e5de]">{product.name}</span>
          </nav>

          <div className="space-y-4">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                product.badge,
              )}`}
            >
              {product.badge}
            </span>
            <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
              {product.name}
            </h1>
            <p className="text-sm text-[#9c9890]">{details?.longDescription}</p>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-xl text-[#e8e5de]">
              What&apos;s included
            </h2>
            <ul className="space-y-2 text-sm text-[#c9c7c0]">
              {details.includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-[#4f98a3]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl text-[#e8e5de]">
              Delivery process
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Purchase on Whop",
                  body: "Checkout completes instantly. Secure, Stripe-powered.",
                  icon: ShoppingCart,
                },
                {
                  title: "Webhook fires instantly",
                  body: "Our system validates and routes the order in milliseconds.",
                  icon: Zap,
                },
                {
                  title: "Download link in your inbox",
                  body: "48-hour secure URL delivered by Resend. No login required.",
                  icon: Mail,
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-4"
                >
                  <step.icon className="h-5 w-5 text-[#4f98a3]" />
                  <h3 className="mt-3 text-sm font-semibold text-[#e8e5de]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#9c9890]">{step.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-8">
            <div className="flex items-center justify-between">
              <div className="font-mono text-4xl text-[#4f98a3]">
                {formatPrice(product.price)}
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                  product.badge,
                )}`}
              >
                {product.badge}
              </span>
            </div>
            <a
              href={product.whopUrl}
              className="mt-6 flex h-14 items-center justify-center rounded-lg bg-[#4f98a3] text-lg font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
            >
              Buy on Whop
            </a>
            <div className="mt-2 text-xs text-[#9c9890]">
              Opens Whop checkout →
            </div>
            <div className="my-6 border-t border-[#2e2d2a]" />
            <div className="space-y-2 text-sm text-[#c9c7c0]">
              {["Instant delivery", "48h secure download", "HMAC-verified"].map(
                (signal) => (
                  <div key={signal} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#4f98a3]" />
                    <span>{signal}</span>
                  </div>
                ),
              )}
            </div>
            {isIntake ? (
              <div className="mt-4 text-xs text-[#9c9890]">
                Your intake form is emailed immediately after purchase.
              </div>
            ) : null}
            {isBundle && bundleItems?.length ? (
              <div className="mt-6 space-y-3 text-sm text-[#c9c7c0]">
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b6861]">
                  Bundle includes
                </div>
                {bundleItems.map((item) =>
                  item ? (
                    <div key={item.slug} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-mono text-xs text-[#9c9890] line-through">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ) : null,
                )}
                {bundleSavings ? (
                  <div className="rounded-lg border border-[#2e2d2a] bg-[#232220] px-3 py-2 text-xs text-[#9c9890]">
                    You save {formatPrice(bundleSavings.amount)} (
                    {bundleSavings.percent}%)
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
