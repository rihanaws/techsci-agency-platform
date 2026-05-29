import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Whop sends HMAC-SHA256 over the raw body.
 * Header is either 'x-whop-signature' or 'whop-signature' (check both).
 * Format: 'sha256=<hex_digest>' or just the hex digest.
 */
export function verifyWhopSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false

  const normalized = signatureHeader.trim()
  if (!normalized) return false
  const normalizedLower = normalized.toLowerCase()
  const receivedHex = normalizedLower.startsWith('sha256=')
    ? normalized.slice(7)
    : normalized

  const expectedHex = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  try {
    const received = Buffer.from(receivedHex, 'hex')
    const expected = Buffer.from(expectedHex, 'hex')
    if (received.length !== expected.length) return false
    return timingSafeEqual(received, expected)
  } catch {
    return false
  }
}
