'use client'

import { useState, type FormEvent } from 'react'
import type { ProductSlug } from '@/lib/products/catalog'

interface IntakeFormProps {
  token: string
  productSlug: ProductSlug
  productName: string
  customerName: string
  expiresAt: string
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#c9c7c0]">
        {label}
        {required && <span className="ml-1 text-[#4f98a3]">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-[#2e2d2a] bg-[#1c1b19] px-4 py-2.5 text-[#e8e5de] placeholder:text-[#6b6861] focus:border-[#4f98a3] focus:outline-none focus:ring-1 focus:ring-[#4f98a3] transition-colors'

const selectClass = `${inputClass} cursor-pointer`

const textareaClass = `${inputClass} min-h-[100px] resize-y`

// ── Per-product form fields ───────────────────────────────────────────────────

function InfraAuditForm({
  data,
  onChange,
}: {
  data: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  return (
    <>
      <Field label="Server Type" id="serverType" required>
        <select
          id="serverType"
          className={selectClass}
          value={data.serverType ?? ''}
          onChange={(e) => onChange('serverType', e.target.value)}
          required
        >
          <option value="">Select server type</option>
          <option value="vps">VPS (Virtual Private Server)</option>
          <option value="managed">Managed / PaaS</option>
          <option value="serverless">Serverless</option>
          <option value="bare-metal">Bare Metal</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="Cloud Provider" id="cloudProvider" required>
        <select
          id="cloudProvider"
          className={selectClass}
          value={data.cloudProvider ?? ''}
          onChange={(e) => onChange('cloudProvider', e.target.value)}
          required
        >
          <option value="">Select cloud provider</option>
          <option value="hetzner">Hetzner</option>
          <option value="aws">AWS</option>
          <option value="digitalocean">DigitalOcean</option>
          <option value="gcp">Google Cloud</option>
          <option value="azure">Azure</option>
          <option value="vultr">Vultr</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="Operating System & Version" id="osVersion" required>
        <input
          id="osVersion"
          type="text"
          className={inputClass}
          placeholder="e.g. Ubuntu 22.04 LTS"
          value={data.osVersion ?? ''}
          onChange={(e) => onChange('osVersion', e.target.value)}
          required
        />
      </Field>

      <Field label="Running Services" id="runningServices" required>
        <textarea
          id="runningServices"
          className={textareaClass}
          placeholder="List the main services running: Nginx, PostgreSQL, Redis, Node.js app, Docker containers, etc."
          value={data.runningServices ?? ''}
          onChange={(e) => onChange('runningServices', e.target.value)}
          required
        />
      </Field>

      <Field label="Cloudflare in Use?" id="cloudflareUse" required>
        <select
          id="cloudflareUse"
          className={selectClass}
          value={data.cloudflareUse ?? ''}
          onChange={(e) => onChange('cloudflareUse', e.target.value)}
          required
        >
          <option value="">Select</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="partial">Partially</option>
        </select>
      </Field>

      <Field label="SSL Provider" id="sslProvider" required>
        <input
          id="sslProvider"
          type="text"
          className={inputClass}
          placeholder="e.g. Let's Encrypt, Cloudflare, Comodo"
          value={data.sslProvider ?? ''}
          onChange={(e) => onChange('sslProvider', e.target.value)}
          required
        />
      </Field>

      <Field label="Current Monitoring" id="monitoring" required>
        <select
          id="monitoring"
          className={selectClass}
          value={data.monitoring ?? ''}
          onChange={(e) => onChange('monitoring', e.target.value)}
          required
        >
          <option value="">Select monitoring</option>
          <option value="none">None</option>
          <option value="uptimerobot">UptimeRobot</option>
          <option value="betterstack">Better Stack</option>
          <option value="datadog">Datadog</option>
          <option value="grafana">Grafana</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="Biggest Concern" id="biggestConcern" required>
        <select
          id="biggestConcern"
          className={selectClass}
          value={data.biggestConcern ?? ''}
          onChange={(e) => onChange('biggestConcern', e.target.value)}
          required
        >
          <option value="">Select concern</option>
          <option value="security">Security / Breaches</option>
          <option value="uptime">Uptime / Reliability</option>
          <option value="cost">Cost Optimisation</option>
          <option value="performance">Performance / Latency</option>
          <option value="compliance">Compliance / GDPR</option>
        </select>
      </Field>

      <Field label="Additional Notes" id="notes">
        <textarea
          id="notes"
          className={textareaClass}
          placeholder="Anything else we should know about your infrastructure..."
          value={data.notes ?? ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </Field>
    </>
  )
}

function AutomationSpecForm({
  data,
  onChange,
}: {
  data: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  return (
    <>
      <Field label="Process Name" id="processName" required>
        <input
          id="processName"
          type="text"
          className={inputClass}
          placeholder="e.g. New Lead to CRM Sync"
          value={data.processName ?? ''}
          onChange={(e) => onChange('processName', e.target.value)}
          required
        />
      </Field>

      <Field label="Current Manual Steps" id="manualSteps" required>
        <textarea
          id="manualSteps"
          className={textareaClass}
          placeholder="Describe step by step what you currently do manually to complete this process..."
          value={data.manualSteps ?? ''}
          onChange={(e) => onChange('manualSteps', e.target.value)}
          required
        />
      </Field>

      <Field label="Apps / Tools Involved" id="toolsInvolved" required>
        <textarea
          id="toolsInvolved"
          className={textareaClass}
          placeholder="e.g. Notion, Slack, Gmail, Airtable, Stripe, Typeform..."
          value={data.toolsInvolved ?? ''}
          onChange={(e) => onChange('toolsInvolved', e.target.value)}
          required
        />
      </Field>

      <Field label="Trigger Type" id="triggerType" required>
        <select
          id="triggerType"
          className={selectClass}
          value={data.triggerType ?? ''}
          onChange={(e) => onChange('triggerType', e.target.value)}
          required
        >
          <option value="">Select trigger</option>
          <option value="webhook">Webhook / API call</option>
          <option value="schedule">Scheduled (time-based)</option>
          <option value="manual">Manual trigger</option>
          <option value="email">Email received</option>
          <option value="form">Form submitted</option>
        </select>
      </Field>

      <Field label="Expected Volume (per day)" id="volume" required>
        <input
          id="volume"
          type="text"
          className={inputClass}
          placeholder="e.g. 50 records per day"
          value={data.volume ?? ''}
          onChange={(e) => onChange('volume', e.target.value)}
          required
        />
      </Field>

      <Field label="Required Output" id="outputType" required>
        <select
          id="outputType"
          className={selectClass}
          value={data.outputType ?? ''}
          onChange={(e) => onChange('outputType', e.target.value)}
          required
        >
          <option value="">Select output</option>
          <option value="email">Email notification</option>
          <option value="notion">Notion entry</option>
          <option value="pdf">PDF document</option>
          <option value="slack">Slack message</option>
          <option value="spreadsheet">Spreadsheet row</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <Field label="Additional Notes" id="notes">
        <textarea
          id="notes"
          className={textareaClass}
          placeholder="Any edge cases, exceptions, or additional context..."
          value={data.notes ?? ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </Field>
    </>
  )
}

function ManagedDevopsForm({
  data,
  onChange,
}: {
  data: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  return (
    <>
      <Field label="Server Endpoint(s) to Monitor" id="serverEndpoints" required>
        <textarea
          id="serverEndpoints"
          className={textareaClass}
          placeholder="e.g. https://app.mysite.com, https://api.mysite.com (one per line)"
          value={data.serverEndpoints ?? ''}
          onChange={(e) => onChange('serverEndpoints', e.target.value)}
          required
        />
      </Field>

      <Field label="UptimeRobot API Key" id="uptimerobotKey">
        <input
          id="uptimerobotKey"
          type="password"
          className={inputClass}
          placeholder="Optional — your UptimeRobot API key"
          value={data.uptimerobotKey ?? ''}
          onChange={(e) => onChange('uptimerobotKey', e.target.value)}
          autoComplete="off"
        />
      </Field>

      <Field label="Better Stack API Key" id="betterstackKey">
        <input
          id="betterstackKey"
          type="password"
          className={inputClass}
          placeholder="Optional — your Better Stack API key"
          value={data.betterstackKey ?? ''}
          onChange={(e) => onChange('betterstackKey', e.target.value)}
          autoComplete="off"
        />
      </Field>

      <Field label="Alert Email" id="alertEmail" required>
        <input
          id="alertEmail"
          type="email"
          className={inputClass}
          placeholder="alerts@yourdomain.com"
          value={data.alertEmail ?? ''}
          onChange={(e) => onChange('alertEmail', e.target.value)}
          required
        />
      </Field>

      <Field label="SSL Domain(s) to Check" id="sslDomains" required>
        <textarea
          id="sslDomains"
          className={textareaClass}
          placeholder="e.g. mysite.com, api.mysite.com (one per line)"
          value={data.sslDomains ?? ''}
          onChange={(e) => onChange('sslDomains', e.target.value)}
          required
        />
      </Field>

      <Field label="Special Instructions" id="specialInstructions">
        <textarea
          id="specialInstructions"
          className={textareaClass}
          placeholder="Any special monitoring requirements, maintenance windows, or additional context..."
          value={data.specialInstructions ?? ''}
          onChange={(e) => onChange('specialInstructions', e.target.value)}
        />
      </Field>
    </>
  )
}

// ── Main Form Component ───────────────────────────────────────────────────────

export function IntakeForm({
  token,
  productSlug,
  productName,
  customerName,
  expiresAt,
}: IntakeFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, formData }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Submission failed')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4f98a3]/20">
          <svg className="h-8 w-8 text-[#4f98a3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#e8e5de]">Intake Submitted!</h2>
          <p className="mt-2 text-[#9c9890]">
            Thank you, {customerName}. We&apos;ve received your information and will begin work on your{' '}
            <span className="text-[#4f98a3]">{productName}</span> shortly.
          </p>
          <p className="mt-4 text-sm text-[#6b6861]">
            You&apos;ll receive a delivery email at the address associated with your purchase.
          </p>
        </div>
      </div>
    )
  }

  const expiryDate = new Date(expiresAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Context bar */}
      <div className="rounded-lg border border-[#4f98a3]/20 bg-[#4f98a3]/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-[#9c9890]">
            Hi <span className="font-medium text-[#e8e5de]">{customerName}</span> — complete your intake for
          </span>
          <span className="rounded-full bg-[#4f98a3]/15 px-3 py-0.5 text-[#4f98a3] font-medium">
            {productName}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#6b6861]">
          This link expires on {expiryDate} · Single use only
        </p>
      </div>

      {/* Product-specific fields */}
      {productSlug === 'infra-audit' && (
        <InfraAuditForm data={formData} onChange={handleChange} />
      )}
      {productSlug === 'automation-spec-doc' && (
        <AutomationSpecForm data={formData} onChange={handleChange} />
      )}
      {productSlug === 'managed-devops' && (
        <ManagedDevopsForm data={formData} onChange={handleChange} />
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        id="intake-submit-btn"
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#4f98a3] px-6 py-3 font-semibold text-white transition-all hover:bg-[#3d7a84] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Intake Form'
        )}
      </button>
    </form>
  )
}
