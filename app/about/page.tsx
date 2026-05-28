export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 pb-24">
      <div className="space-y-3">
        <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
          Built by a founder, for founders.
        </h1>
      </div>

      <section className="space-y-4 text-sm text-[#c9c7c0]">
        <h2 className="font-display text-xl text-[#e8e5de]">Who</h2>
        <p>
          Rihan (Sayem Abdullah Rihan) is a technical founder and IT consultant
          based in Dhaka, Bangladesh. He&apos;s been building production systems
          since 2015 across IT administration, infrastructure management, and
          SaaS.
        </p>
        <p>
          Rihan Consulting operates under TechSci Inc (Delaware C-Corp),
          providing consulting and digital products to clients in the US and
          internationally.
        </p>
        <p>
          This platform is the fulfillment layer for digital products built and
          curated by Rihan — all delivered automatically, no human intervention
          required after purchase.
        </p>
      </section>

      <section className="space-y-4 text-sm text-[#c9c7c0]">
        <h2 className="font-display text-xl text-[#e8e5de]">
          The stack philosophy
        </h2>
        <p>
          Every product in this catalog was built with the same stack used to
          run this platform: Next.js 15, Bun, Prisma on Neon, Cloudflare R2,
          Make.com for orchestration, and Claude Sonnet for AI generation.
        </p>
        <p>If it&apos;s not production-grade, it doesn&apos;t ship.</p>
      </section>

      <section className="space-y-2 text-xs text-[#9c9890]">
        <h3 className="font-semibold text-[#e8e5de]">Entity notice</h3>
        <p>Rihan Consulting is Rihan&apos;s personal consulting brand (domain: rihan.cloud).</p>
        <p>TechSci Inc is a Delaware C-Corp.</p>
        <p>This platform (agency.rihan.cloud) is operated by TechSci Inc.</p>
      </section>

      <section className="space-y-2 text-sm text-[#c9c7c0]">
        <h3 className="font-display text-xl text-[#e8e5de]">Contact</h3>
        <p>
          Email:{" "}
          <a href="mailto:hello@rihan.cloud" className="text-[#4f98a3]">
            hello@rihan.cloud
          </a>
        </p>
        <p>WhatsApp/Telegram: available via Whop store page</p>
      </section>
    </div>
  );
}
