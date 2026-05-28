export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-24">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#e8e5de] md:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-[#9c9890]">Last updated: May 2026</p>
      </div>
      <div className="space-y-4 text-sm text-[#c9c7c0]">
        <ul className="list-disc space-y-2 pl-6">
          <li>We collect: email (from Whop purchase), purchase metadata, intake form responses.</li>
          <li>
            We do not: sell your data, store payment info (Stripe handles it),
            share with third parties except Notion (our CRM) and Resend (email delivery).
          </li>
          <li>Intake form data: stored in Neon PostgreSQL, used only to generate your document.</li>
          <li>Download URLs: 48-hour TTL, then expire permanently.</li>
          <li>
            Contact:{" "}
            <a href="mailto:hello@rihan.cloud" className="text-[#4f98a3]">
              hello@rihan.cloud
            </a>{" "}
            for data removal requests.
          </li>
          <li>Jurisdiction: Delaware, USA.</li>
        </ul>
      </div>
    </div>
  );
}
