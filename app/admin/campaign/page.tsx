'use client'

import { useState, type FormEvent } from 'react'
import { triggerCampaign } from './actions'

export default function AdminCampaign() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    campaignName: '',
    productSlug: '',
    productUrl: '',
    launchPrice: '',
    regularPrice: '',
    offerExpiry: '',
    targetAudience: '',
    keyBenefit: '',
  })

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    const payload = {
      campaignName: formData.campaignName,
      productSlug: formData.productSlug,
      productUrl: formData.productUrl,
      launchPrice: Math.round(parseFloat(formData.launchPrice) * 100),
      regularPrice: Math.round(parseFloat(formData.regularPrice) * 100),
      offerExpiry: new Date(formData.offerExpiry).toISOString(),
      targetAudience: formData.targetAudience,
      keyBenefit: formData.keyBenefit,
    }

    try {
      const res = await triggerCampaign(payload)
      if (res.success) {
        setSuccess(true)
        setFormData({
          campaignName: '',
          productSlug: '',
          productUrl: '',
          launchPrice: '',
          regularPrice: '',
          offerExpiry: '',
          targetAudience: '',
          keyBenefit: '',
        })
      } else {
        setError(res.error ?? 'Failed to trigger campaign.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#e8e5de]">Marketing Campaigns</h1>
        <p className="mt-1 text-sm text-[#9c9890]">
          Trigger automated email copy generation and marketing campaigns using Make.com (Scenario F).
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campaignName" className="text-sm font-medium text-[#c9c7c0]">
                Campaign Name
              </label>
              <input
                id="campaignName"
                type="text"
                required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                placeholder="e.g. Summer AI Agent Launch"
                value={formData.campaignName}
                onChange={(e) => handleChange('campaignName', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="productSlug" className="text-sm font-medium text-[#c9c7c0]">
                Product Slug
              </label>
              <input
                id="productSlug"
                type="text"
                required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                placeholder="e.g. ai-agent-pack"
                value={formData.productSlug}
                onChange={(e) => handleChange('productSlug', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="productUrl" className="text-sm font-medium text-[#c9c7c0]">
              Product Purchase URL
            </label>
            <input
              id="productUrl"
              type="url"
              required
              className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              placeholder="https://whop.com/checkout/..."
              value={formData.productUrl}
              onChange={(e) => handleChange('productUrl', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="launchPrice" className="text-sm font-medium text-[#c9c7c0]">
                Launch Price ($)
              </label>
              <input
                id="launchPrice"
                type="number"
                step="0.01"
                required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                placeholder="49.00"
                value={formData.launchPrice}
                onChange={(e) => handleChange('launchPrice', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="regularPrice" className="text-sm font-medium text-[#c9c7c0]">
                Regular Price ($)
              </label>
              <input
                id="regularPrice"
                type="number"
                step="0.01"
                required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                placeholder="99.00"
                value={formData.regularPrice}
                onChange={(e) => handleChange('regularPrice', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="offerExpiry" className="text-sm font-medium text-[#c9c7c0]">
                Offer Expiry
              </label>
              <input
                id="offerExpiry"
                type="datetime-local"
                required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                value={formData.offerExpiry}
                onChange={(e) => handleChange('offerExpiry', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="targetAudience" className="text-sm font-medium text-[#c9c7c0]">
              Target Audience
            </label>
            <input
              id="targetAudience"
              type="text"
              required
              className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              placeholder="e.g. Solo SaaS founders wanting to automate customer support"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyBenefit" className="text-sm font-medium text-[#c9c7c0]">
              Core Offer Benefit
            </label>
            <textarea
              id="keyBenefit"
              required
              className="min-h-[80px] rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              placeholder="e.g. Save 10 hours a week by letting AI triage and reply to standard help desk tickets."
              value={formData.keyBenefit}
              onChange={(e) => handleChange('keyBenefit', e.target.value)}
            />
          </div>

          {success && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Campaign successfully triggered in Make! Check execution logs there.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            id="campaign-trigger-btn"
            type="submit"
            disabled={loading}
            className="flex items-center justify-center rounded-lg bg-[#4f98a3] px-6 py-3 font-semibold text-white transition-all hover:bg-[#3d7a84] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Triggering...' : 'Trigger Campaign'}
          </button>
        </form>
      </div>
    </div>
  )
}
