import { describe, it, expect } from 'vitest'
import { verifyWhopSignature } from '../../lib/whop/verify'
import { createHmac } from 'crypto'

describe('verifyWhopSignature', () => {
  const secret = 'test-webhook-secret'
  const rawBody = JSON.stringify({ event: 'test.event', data: { id: 123 } })

  it('should verify correct signature with sha256= prefix', () => {
    const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex')
    const header = `sha256=${expectedHex}`

    const isValid = verifyWhopSignature(rawBody, header, secret)
    expect(isValid).toBe(true)
  })

  it('should verify correct signature without sha256= prefix', () => {
    const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex')

    const isValid = verifyWhopSignature(rawBody, expectedHex, secret)
    expect(isValid).toBe(true)
  })

  it('should fail with incorrect signature', () => {
    const isValid = verifyWhopSignature(rawBody, 'sha256=invalid-signature-hex', secret)
    expect(isValid).toBe(false)
  })

  it('should fail with missing header or secret', () => {
    expect(verifyWhopSignature(rawBody, null, secret)).toBe(false)
    expect(verifyWhopSignature(rawBody, 'sha256=something', '')).toBe(false)
  })
})
