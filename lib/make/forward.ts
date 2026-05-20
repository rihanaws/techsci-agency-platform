/**
 * forward(payload, targetUrl) — never throws.
 * Make failures are owner-notified but must not fail the Whop webhook response.
 * The route handler resolves the correct Make URL before calling this.
 */
export async function forwardToMake(
  payload: unknown,
  targetUrl: string,
): Promise<boolean> {
  const internalSecret = process.env.INTERNAL_WEBHOOK_SECRET
  if (!internalSecret) {
    console.error('[make/forward] INTERNAL_WEBHOOK_SECRET not set')
    return false
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Webhook-Secret': internalSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.error(`[make/forward] HTTP ${res.status}`, { targetUrl })
      return false
    }

    return true
  } catch (err) {
    console.error('[make/forward] fetch threw', { error: (err as Error).message, targetUrl })
    return false
  }
}
