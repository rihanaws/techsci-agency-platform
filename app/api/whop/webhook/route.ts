import { NextRequest, NextResponse } from 'next/server'
import { verifyWhopSignature } from '@/lib/whop/verify'
import { WhopWebhookEventSchema } from '@/lib/whop/types'
import { normalizeWhopEvent } from '@/lib/whop/normalize'
import { isEventProcessed, markEventProcessed } from '@/lib/idempotency/check'
import { forwardToMake } from '@/lib/make/forward'
import { notifyOwner } from '@/lib/telegram/notify'
import { generateIntakeToken } from '@/lib/intake/tokens'
import { INTAKE_SLUGS, SUBSCRIPTION_SLUGS } from '@/lib/products/catalog'
import type { ProductSlug } from '@/lib/products/catalog'

const HANDLED_EVENTS = new Set(['payment.succeeded', 'membership.went_valid'])

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body FIRST — signature is over raw bytes
  const rawBody = await req.text()

  // 2. Verify Whop signature — check both possible header names
  const signatureHeader =
    req.headers.get('x-whop-signature') ??
    req.headers.get('whop-signature')

  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[whop-webhook] WHOP_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'misconfigured' }, { status: 500 })
  }

  if (!verifyWhopSignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 3. Parse + Zod validate
  let parsed: ReturnType<typeof WhopWebhookEventSchema.safeParse>
  try {
    parsed = WhopWebhookEventSchema.safeParse(JSON.parse(rawBody))
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!parsed.success) {
    console.error('[whop-webhook] Zod validation failed', parsed.error.flatten())
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }

  const event = parsed.data

  // 4. Filter unhandled event types
  if (!HANDLED_EVENTS.has(event.action)) {
    return NextResponse.json({ received: true, skipped: true })
  }

  // 5. Idempotency check — runs before Make ever sees this event
  const alreadyProcessed = await isEventProcessed(event.event_id)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // 6. Normalize
  const purchase = normalizeWhopEvent(event)

  // 7. Generate intake token for intake products
  if (INTAKE_SLUGS.has(purchase.productSlug as ProductSlug)) {
    try {
      const token = await generateIntakeToken({
        eventId: purchase.eventId,
        productSlug: purchase.productSlug,
        customerEmail: purchase.customerEmail,
        customerName: purchase.customerName,
      })
      purchase.intakeToken = token

      // Log initial intake order in Notion
      const { logOrder } = await import('@/lib/notion/orders')
      await logOrder({
        eventId: purchase.eventId,
        productSlug: purchase.productSlug,
        customerEmail: purchase.customerEmail,
        customerName: purchase.customerName,
        amount: purchase.amount,
        currency: purchase.currency,
        status: 'awaiting_intake',
        createdAt: purchase.createdAt,
      })
    } catch (err) {
      console.error('[whop-webhook] Failed to generate intake token or log order', err)
      await notifyOwner(`⚠️ Intake token generation or Notion logging failed for event ${purchase.eventId}`)
      return NextResponse.json({ error: 'token_generation_failed' }, { status: 500 })
    }
  }

  // 8. Resolve Make webhook URL
  const makeUrl = resolveMakeUrl(purchase.productSlug, purchase.isSubscription)
  if (!makeUrl) {
    console.error('[whop-webhook] No Make URL for slug', purchase.productSlug)
    await notifyOwner(`⚠️ No Make URL configured for: ${purchase.productSlug}`)
    return NextResponse.json({ received: true, warning: 'no_route' })
  }

  // 9. Forward to Make — mark processed only on success so Whop can retry
  const forwardPayload = {
    source: 'whop',
    receivedAt: new Date().toISOString(),
    purchase,
  }

  const forwarded = await forwardToMake(forwardPayload, makeUrl)

  if (!forwarded) {
    await notifyOwner(
      `⚠️ Make forward failed for event ${purchase.eventId} (${purchase.productSlug})`,
    )
    // Return 500 so Whop retries
    return NextResponse.json({ error: 'upstream_failed' }, { status: 500 })
  }

  // 10. Mark processed only after successful forward
  await markEventProcessed(
    purchase.eventId,
    purchase.productSlug,
    purchase.customerEmail,
  )

  return NextResponse.json({ received: true })
}

function resolveMakeUrl(slug: string, isSubscription: boolean): string | null {
  // Subscription activation → Scenario D
  if (isSubscription && SUBSCRIPTION_SLUGS.has(slug as ProductSlug)) {
    return process.env.MAKE_WEBHOOK_URL_SCENARIO_D ?? null
  }
  // All one-time purchases (including intake) → Scenario A
  return process.env.MAKE_WEBHOOK_URL_SCENARIO_A ?? null
}

export function GET(): NextResponse {
  return NextResponse.json({ error: 'method not allowed' }, { status: 405 })
}
