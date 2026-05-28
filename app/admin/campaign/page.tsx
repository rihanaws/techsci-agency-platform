'use client'

import { useState, type FormEvent } from 'react'
import { triggerCampaign } from './actions'
import { PRODUCT_CATALOG } from '@/lib/products/catalog'

export default function AdminCampaign() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    campaignName: '', productSlug: '', productUrl: '',
    launchPrice: '', regularPrice: '', offerExpiry: '',
    targetAudience: '', keyBenefit: '',
  })

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setSuccess(false); setError(null)
    try {
      const res = await triggerCampaign({
        campaignName: formData.campaignName,
        productSlug: formData.productSlug,
        productUrl: formData.productUrl,
        launchPrice: Math.round(parseFloat(formData.launchPrice) * 100),
        regularPrice: Math.round(parseFloat(formData.regularPrice) * 100),
        offerExpiry: new Date(formData.offerExpiry).toISOString(),
        targetAudience: formData.targetAudience,
        keyBenefit: formData.keyBenefit,
      })
      if (res.success) {
        setSuccess(true)
        setFormData({ campaignName: '', productSlug: '', productUrl: '', launchPrice: '', regularPrice: '', offerExpiry: '', targetAudience: '', keyBenefit: '' })
      } else { setError(res.error ?? 'Failed') }
    } catch (err) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  const slugs = Object.keys(PRODUCT_CATALOG)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#e8e5de]">Marketing Campaigns</h1>
        <p className="mt-1 text-sm text-[#9c9890]">Trigger Make.com Scenario F campaign engine.</p>
      </div>
      <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="campaignName" className="text-sm font-medium text-[#c9c7c0]">Campaign Name</label>
              <input id="campaignName" type="text" required placeholder="e.g. AI Agent Launch"
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                value={formData.campaignName} onChange={e => set('campaignName', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="productSlug" className="text-sm font-medium text-[#c9c7c0]">Product</label>
              <select id="productSlug" required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] focus:border-[#4f98a3] focus:outline-none cursor-pointer"
                value={formData.productSlug} onChange={e => set('productSlug', e.target.value)}>
                <option value="">Select product</option>
                {slugs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="productUrl" className="text-sm font-medium text-[#c9c7c0]">Purchase URL</label>
            <input id="productUrl" type="url" required placeholder="https://whop.com/checkout/..."
              className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              value={formData.productUrl} onChange={e => set('productUrl', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[
              { id: 'launchPrice', label: 'Launch ($)', ph: '49.00' },
              { id: 'regularPrice', label: 'Regular ($)', ph: '79.00' },
            ].map(f => (
              <div key={f.id} className="flex flex-col gap-1.5">
                <label htmlFor={f.id} className="text-sm font-medium text-[#c9c7c0]">{f.label}</label>
                <input id={f.id} type="number" step="0.01" required placeholder={f.ph}
                  className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
                  value={formData[f.id as keyof typeof formData]} onChange={e => set(f.id, e.target.value)} />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="offerExpiry" className="text-sm font-medium text-[#c9c7c0]">Offer Expiry</label>
              <input id="offerExpiry" type="datetime-local" required
                className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] focus:border-[#4f98a3] focus:outline-none"
                value={formData.offerExpiry} onChange={e => set('offerExpiry', e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="targetAudience" className="text-sm font-medium text-[#c9c7c0]">Target Audience</label>
            <input id="targetAudience" type="text" required placeholder="e.g. Solo founders automating their stack"
              className="rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              value={formData.targetAudience} onChange={e => set('targetAudience', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="keyBenefit" className="text-sm font-medium text-[#c9c7c0]">Core Benefit</label>
            <textarea id="keyBenefit" required placeholder="e.g. Install 144 AI agents in 60 seconds."
              className="min-h-[80px] rounded-lg border border-[#2e2d2a] bg-[#171614] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none"
              value={formData.keyBenefit} onChange={e => set('keyBenefit', e.target.value)} />
          </div>
          {success && <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">Campaign triggered in Make! Check Scenario F execution logs.</div>}
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
          <button type="submit" disabled={loading}
            className="flex items-center justify-center rounded-lg bg-[#4f98a3] px-6 py-3 font-semibold text-white transition-all hover:bg-[#3d7a84] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]">
            {loading ? 'Triggering...' : 'Trigger Campaign'}
          </button>
        </form>
      </div>
    </div>
  )
}
