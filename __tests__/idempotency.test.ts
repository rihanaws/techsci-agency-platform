import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, boolean>()

vi.mock('@prisma/client', () => {
  const prisma = {
    whopProcessedEvent: {
      findUnique: vi.fn(async ({ where }: { where: { eventId: string } }) =>
        store.has(where.eventId) ? { eventId: where.eventId } : null
      ),
      create: vi.fn(async ({ data }: { data: { eventId: string; productSlug: string; customerEmail: string } }) => {
        store.set(data.eventId, true)
        return data
      }),
    },
  }
  class PrismaClient {
    whopProcessedEvent = prisma.whopProcessedEvent
  }
  return { PrismaClient }
})

describe('Idempotency', () => {
  beforeEach(() => { store.clear(); vi.resetModules() })

  it('returns false for a new event', async () => {
    const { isEventProcessed } = await import('@/lib/idempotency/check')
    expect(await isEventProcessed('evt_new')).toBe(false)
  })

  it('returns true after markEventProcessed', async () => {
    const { isEventProcessed, markEventProcessed } = await import('@/lib/idempotency/check')
    await markEventProcessed('evt_mark', 'ai-agent-pack', 'buyer@example.com')
    expect(await isEventProcessed('evt_mark')).toBe(true)
  })

  it('second call on same eventId returns true', async () => {
    const { isEventProcessed, markEventProcessed } = await import('@/lib/idempotency/check')
    await markEventProcessed('evt_dup', 'devops-starter-kit', 'dup@example.com')
    expect(await isEventProcessed('evt_dup')).toBe(true)
  })
})
