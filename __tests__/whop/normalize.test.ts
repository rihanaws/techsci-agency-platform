import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { normalizeWhopEvent } from '../../lib/whop/normalize'
import type { WhopWebhookEvent } from '../../lib/whop/types'

describe('normalizeWhopEvent', () => {
  const envBackup = { ...process.env }

  beforeAll(() => {
    process.env.WHOP_PRODUCT_ID_AI_AGENT_PACK = 'prod_12345'
  })

  afterAll(() => {
    process.env = envBackup
  })

  it('should normalize valid Whop webhook membership event correctly', () => {
    const rawEvent: WhopWebhookEvent = {
      event_id: 'evt_99999',
      action: 'payment.succeeded',
      data: {
        object: {
          id: 'mem_88888',
          user: {
            id: 'usr_77777',
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
          },
          product: {
            id: 'prod_12345',
            name: 'AI Agent Pack',
          },
          order_value: '49.00',
          currency: 'usd',
          status: 'active',
          created_at: 1716200000,
          renewal_period_end: null,
        },
      },
    }

    const normalized = normalizeWhopEvent(rawEvent)

    expect(normalized.eventId).toBe('evt_99999')
    expect(normalized.eventType).toBe('payment.succeeded')
    expect(normalized.membershipId).toBe('mem_88888')
    expect(normalized.productId).toBe('prod_12345')
    expect(normalized.productSlug).toBe('ai-agent-pack')
    expect(normalized.customerEmail).toBe('test@example.com')
    expect(normalized.customerName).toBe('Test User')
    expect(normalized.customerId).toBe('usr_77777')
    expect(normalized.amount).toBe(4900)
    expect(normalized.currency).toBe('usd')
    expect(normalized.isSubscription).toBe(false)
    expect(normalized.intakeToken).toBeNull()
  })
})
