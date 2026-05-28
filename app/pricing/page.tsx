import PricingFaq from "@/app/pricing/PricingFaq";
import {
  CATEGORY_LABELS,
  PRODUCTS,
  formatPrice,
  getBundleValue,
} from "@/lib/marketing/products";

const oneTimeProducts = PRODUCTS.filter(
  (product) => !product.type.startsWith("subscription"),
).sort((a, b) => a.price - b.price);

const bundles = PRODUCTS.filter((product) => product.type === "bundle");
const subscriptions = PRODUCTS.filter((product) =>
  product.type.startsWith("subscription"),
);

function deliveryLabel(type: string) {
  if (type === "intake") return "Intake form + AI report";
  if (type === "bundle") return "Multi-file bundle";
  return "48h download link";
}

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24">
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
          Simple, honest pricing.
        </h1>
        <p className="text-sm text-[#9c9890]">
          One-time products. Monthly subscriptions. No upsells, no drip content,
          no paywalled basics.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          One-time products
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#2e2d2a]">
          <table className="w-full text-left text-sm text-[#c9c7c0]">
            <thead className="bg-[#1c1b19] text-xs uppercase tracking-[0.2em] text-[#6b6861]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {oneTimeProducts.map((product) => (
                <tr
                  key={product.slug}
                  className="border-t border-[#2e2d2a]"
                >
                  <td className="px-4 py-4 font-semibold text-[#e8e5de]">
                    {product.name}
                  </td>
                  <td className="px-4 py-4 text-[#9c9890]">
                    {CATEGORY_LABELS[product.category]}
                  </td>
                  <td className="px-4 py-4 font-mono text-[#4f98a3]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-4 text-[#9c9890]">
                    {deliveryLabel(product.type)}
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={product.whopUrl}
                      className="rounded-lg border border-[#2e2d2a] px-3 py-2 text-xs font-semibold text-[#e8e5de] transition hover:border-[#4f98a3]"
                    >
                      Buy
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          Bundle savings
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {bundles.map((bundle) => {
            const bundleValue = getBundleValue(bundle.slug);
            const savings = bundleValue ? bundleValue - bundle.price : 0;
            const percent = bundleValue
              ? Math.round((1 - bundle.price / bundleValue) * 100)
              : 0;
            return (
              <div
                key={bundle.slug}
                className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6"
              >
                <h3 className="text-lg font-semibold text-[#e8e5de]">
                  {bundle.name}
                </h3>
                <div className="mt-4 text-sm text-[#9c9890]">
                  Individual value:{" "}
                  <span className="font-mono line-through">
                    {bundleValue ? formatPrice(bundleValue) : "—"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[#e8e5de]">
                  Bundle price:{" "}
                  <span className="font-mono text-[#4f98a3]">
                    {formatPrice(bundle.price)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[#9c9890]">
                  You save:{" "}
                  <span className="font-mono text-[#4f98a3]">
                    {formatPrice(savings)} ({percent}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          Subscriptions
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {subscriptions.map((product) => (
            <div
              key={product.slug}
              className={`rounded-2xl border bg-[#1c1b19] p-6 ${
                product.slug === "managed-devops"
                  ? "border-[#4f98a3]"
                  : "border-[#2e2d2a]"
              }`}
            >
              <h3 className="text-lg font-semibold text-[#e8e5de]">
                {product.name}
              </h3>
              <p className="mt-2 text-sm text-[#9c9890]">
                {product.description}
              </p>
              <div className="mt-4 font-mono text-2xl text-[#4f98a3]">
                {formatPrice(product.price)}
                <span className="ml-2 text-xs text-[#9c9890]">/month</span>
              </div>
              <a
                href={product.whopUrl}
                className="mt-6 inline-flex rounded-lg bg-[#4f98a3] px-4 py-2 text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
              >
                Join on Whop →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">FAQ</h2>
        <PricingFaq />
      </section>
    </div>
  );
}
