import Link from "next/link";
import {
  Bot,
  LayoutGrid,
  Mail,
  Server,
  ShieldCheck,
  ShoppingCart,
  Workflow,
  Zap,
} from "lucide-react";
import StatStrip from "@/components/StatStrip";
import { PRODUCTS, formatPrice, getBadgeClasses } from "@/lib/marketing/products";

const featuredProducts = PRODUCTS.filter((product) => product.featured);

const categoryCards = [
  { label: "AI Agents", icon: Bot, price: formatPrice(4900), filter: "ai-agents" },
  { label: "DevOps", icon: Server, price: formatPrice(5900), filter: "devops" },
  {
    label: "Make Automation",
    icon: Workflow,
    price: formatPrice(5900),
    filter: "automation",
  },
  {
    label: "SaaS Boilerplates",
    icon: LayoutGrid,
    price: formatPrice(14900),
    filter: "saas",
  },
  {
    label: "Infrastructure Audits",
    icon: ShieldCheck,
    price: formatPrice(9900),
    filter: "devops",
  },
];

const trustBadges = [
  "Instant delivery",
  "Prisma-backed idempotency",
  "HMAC-verified webhooks",
  "48h download TTL",
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,152,163,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(46,45,42,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,45,42,0.35)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-8 md:pt-16">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-display text-[40px] leading-tight text-[#e8e5de] md:text-[64px]">
              Digital products.
              <br />
              Delivered automatically.
            </h1>
            <p className="text-lg text-[#9c9890]">
              144 AI agents, automation scenarios, SaaS boilerplates, and
              infrastructure audits. Buy on Whop, receive in seconds. No humans
              involved.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/products"
                className="flex h-12 items-center justify-center rounded-lg bg-[#4f98a3] px-8 text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
              >
                Browse Products
              </Link>
              <Link
                href="/pricing"
                className="flex h-12 items-center justify-center rounded-lg border border-[#2e2d2a] px-8 text-sm font-semibold text-[#e8e5de] transition hover:border-[#4f98a3]"
              >
                See Pricing
              </Link>
            </div>
          </div>
          <StatStrip />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-[#e8e5de]">
            Start building today
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-[#4f98a3] hover:underline"
          >
            View all 14 products →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <div
              key={product.slug}
              className="relative rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6"
            >
              <span
                className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                  product.badge,
                )}`}
              >
                {product.badge}
              </span>
              <h3 className="text-lg font-semibold text-[#e8e5de]">
                {product.name}
              </h3>
              <p className="mt-3 text-sm text-[#9c9890]">
                {product.description}
              </p>
              <div className="mt-6 font-mono text-2xl text-[#4f98a3]">
                {formatPrice(product.price)}
              </div>
              <a
                href={product.whopUrl}
                className="mt-6 inline-flex text-sm font-semibold text-[#4f98a3] hover:underline"
              >
                Buy on Whop →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          Zero-touch fulfillment
        </h2>
        <div className="relative mt-10">
          <div className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-[#4f98a3]/40 md:block" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Purchase on Whop",
                icon: ShoppingCart,
                body: "Complete checkout in seconds. Stripe-powered, secure.",
              },
              {
                title: "Webhook fires instantly",
                icon: Zap,
                body: "Our platform receives the signal and starts processing within 200ms.",
              },
              {
                title: "Download link in your inbox",
                icon: Mail,
                body: "48-hour secure presigned URL delivered by Resend. No login required.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="relative z-10 rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6"
              >
                <step.icon className="h-6 w-6 text-[#4f98a3]" />
                <h3 className="mt-4 text-lg font-semibold text-[#e8e5de]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[#9c9890]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          Category spotlight
        </h2>
        <div className="mt-6 flex gap-4 overflow-x-auto md:grid md:grid-cols-5 md:overflow-visible">
          {categoryCards.map((category) => (
            <Link
              key={category.label}
              href={`/products?filter=${category.filter}`}
              className="flex min-w-[220px] flex-col gap-3 rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-5 transition hover:border-[#4f98a3]"
            >
              <category.icon className="h-5 w-5 text-[#4f98a3]" />
              <div className="text-sm font-semibold text-[#e8e5de]">
                {category.label}
              </div>
              <div className="text-xs text-[#9c9890]">
                from <span className="font-mono text-[#4f98a3]">{category.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <h2 className="font-display text-2xl text-[#e8e5de]">
          Trusted infrastructure
        </h2>
        <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-[#9c9890]">
          {["Next.js", "Cloudflare R2", "Anthropic", "Make.com", "Whop"].map(
            (logo) => (
              <span key={logo} className="rounded-full border border-[#2e2d2a] px-4 py-2">
                {logo}
              </span>
            ),
          )}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6">
            <div className="flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#2e2d2a] bg-[#232220] px-3 py-1 text-xs text-[#c9c7c0]"
                >
                  {badge}
                </span>
              ))}
            </div>
            <blockquote className="mt-6 text-lg text-[#e8e5de]">
              “Every product in this catalog is delivered by code, not humans.”
            </blockquote>
            <p className="mt-3 text-sm text-[#9c9890]">
              Rihan, Founder — Rihan Consulting
            </p>
          </div>
          <div className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19] p-6">
            <h3 className="text-lg font-semibold text-[#e8e5de]">
              Digital products. Delivered automatically.
            </h3>
            <p className="mt-3 text-sm text-[#9c9890]">
              HMAC-verified webhooks, Prisma idempotency, and 48-hour presigned
              downloads mean fulfillment runs without human involvement.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex text-sm font-semibold text-[#4f98a3] hover:underline"
            >
              Browse the catalog →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#2e2d2a] border-l-4 border-l-[#4f98a3] bg-[#1c1b19] p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-[#e8e5de]">
              Your first purchase is waiting.
            </h2>
            <p className="mt-2 text-sm text-[#9c9890]">
              14 products. Instant delivery. Everything your stack needs.
            </p>
          </div>
          <Link
            href="/products"
            className="flex h-12 items-center justify-center rounded-lg bg-[#4f98a3] px-6 text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
          >
            Browse the catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
