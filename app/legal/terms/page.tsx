export default function TermsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-24">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-[#9c9890]">Last updated: May 2026</p>
      </div>
      <div className="space-y-4 text-sm text-[#c9c7c0]">
        <ul className="list-disc space-y-2 pl-6">
          <li>Products are digital goods — no refunds.</li>
          <li>
            Licenses: MIT for agent packs, commercial license for boilerplates,
            single-use for audit reports.
          </li>
          <li>
            No warranties on AI-generated content (audit reports are guidance,
            not professional advice).
          </li>
          <li>Platform operated by TechSci Inc, Wilmington, Delaware.</li>
          <li>Disputes: Delaware law.</li>
        </ul>
      </div>
    </div>
  );
}
