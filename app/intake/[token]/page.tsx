import { validateIntakeToken } from '@/lib/intake/tokens'
import { PRODUCT_CATALOG } from '@/lib/products/catalog'
import type { ProductSlug } from '@/lib/products/catalog'
import { IntakeForm } from './IntakeForm'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ token: string }>
}

export const metadata: Metadata = {
  title: 'Complete Your Intake — Rihan Consulting',
  description: 'Complete your product intake form to get started.',
  robots: 'noindex, nofollow',
}

const SUPPORTED_INTAKE_SLUGS: ProductSlug[] = [
  'infra-audit',
  'automation-spec-doc',
  'managed-devops',
]

export default async function IntakePage({ params }: PageProps) {
  const { token } = await params
  const { valid, record } = await validateIntakeToken(token)

  // ── Error states ──────────────────────────────────────────────────────────

  if (!record) {
    return <IntakeErrorPage title="Invalid Token" message="This intake link is not valid. Please check your email for the correct link." />
  }

  if (record.usedAt) {
    return (
      <IntakeErrorPage
        title="Already Submitted"
        message="This intake form has already been submitted. If you believe this is an error, please contact us at hello@rihan.cloud."
      />
    )
  }

  if (!valid) {
    return (
      <IntakeErrorPage
        title="Link Expired"
        message={`This intake link expired on ${new Date(record.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Please contact hello@rihan.cloud to request a new link.`}
      />
    )
  }

  const productSlug = record.productSlug as ProductSlug

  if (!SUPPORTED_INTAKE_SLUGS.includes(productSlug)) {
    return (
      <IntakeErrorPage
        title="Unsupported Product"
        message={`No intake form exists for product: ${productSlug}. Please contact hello@rihan.cloud.`}
      />
    )
  }

  const product = PRODUCT_CATALOG[productSlug]
  const productName = product?.name ?? productSlug

  return (
    <main className="min-h-screen bg-[#171614]">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <header className="mb-10 flex flex-col items-start gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4f98a3]">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#4f98a3]">
                Rihan Consulting
              </p>
              <p className="text-xs text-[#6b6861]">× TechSci Inc</p>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-[#e8e5de]">{productName}</h1>
            <p className="mt-1 text-sm text-[#9c9890]">
              Please fill out this form so we can begin processing your order. All fields marked{' '}
              <span className="text-[#4f98a3]">*</span> are required.
            </p>
          </div>
        </header>

        {/* Form card */}
        <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-6 shadow-2xl">
          <IntakeForm
            token={token}
            productSlug={productSlug}
            productName={productName}
            customerName={record.customerName}
            expiresAt={record.expiresAt.toISOString()}
          />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#6b6861]">
          <p>Questions? Email us at{' '}
            <a href="mailto:hello@rihan.cloud" className="text-[#4f98a3] hover:underline">
              hello@rihan.cloud
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}

function IntakeErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#171614] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#e8e5de]">{title}</h1>
        <p className="mt-2 text-sm text-[#9c9890]">{message}</p>
        <div className="mt-2">
          <p className="flex items-center gap-2">
            <span className="text-xs text-[#6b6861]">Rihan Consulting</span>
            <span className="text-[#4f98a3]">·</span>
            <a href="mailto:hello@rihan.cloud" className="text-xs text-[#4f98a3] hover:underline">
              hello@rihan.cloud
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
