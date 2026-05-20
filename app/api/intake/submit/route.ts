import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateIntakeToken, markTokenUsed } from '@/lib/intake/tokens'
import { forwardToMake } from '@/lib/make/forward'
import { notifyOwner } from '@/lib/telegram/notify'

const SubmitSchema = z.object({
  token: z.string().uuid(),
  formData: z.record(z.string(), z.unknown()),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = SubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { token, formData } = parsed.data

  const { valid, record } = await validateIntakeToken(token)
  if (!valid || !record) {
    return NextResponse.json({ error: 'invalid or expired token' }, { status: 403 })
  }

  const makeUrl = process.env.MAKE_WEBHOOK_URL_SCENARIO_A2
  if (!makeUrl) {
    console.error('[intake/submit] MAKE_WEBHOOK_URL_SCENARIO_A2 not set')
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }

  const payload = {
    source: 'agency-intake',
    productSlug: record.productSlug,
    eventId: record.eventId,
    customerEmail: record.customerEmail,
    customerName: record.customerName,
    formData,
  }

  const forwarded = await forwardToMake(payload, makeUrl)
  if (!forwarded) {
    await notifyOwner(`⚠️ Make A2 forward failed for intake token ${token}`)
    return NextResponse.json({ error: 'upstream_failed' }, { status: 500 })
  }

  await markTokenUsed(token)

  return NextResponse.json({ success: true })
}
