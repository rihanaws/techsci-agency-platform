import { describe, it, expect, vi, beforeEach } from 'vitest'

const store = new Map<string, { token: string; eventId: string; productSlug: string; customerEmail: string; customerName: string; usedAt: Date | null; expiresAt: Date }>()

vi.mock('@prisma/client', () => {
  const prisma = {
    whopIntakeToken: {
      create: vi.fn(async ({ data }: { data: { token: string; eventId: string; productSlug: string; customerEmail: string; customerName: string; expiresAt: Date } }) => {
        store.set(data.token, { ...data, usedAt: null })
        return data
      }),
      findUnique: vi.fn(async ({ where }: { where: { token: string } }) => store.get(where.token) ?? null),
      update: vi.fn(async ({ where, data }: { where: { token: string }; data: { usedAt: Date } }) => {
        const r = store.get(where.token)
        if (r) r.usedAt = data.usedAt
        return r
      }),
    },
  }
  return { PrismaClient: vi.fn(() => prisma) }
})

describe('Intake tokens', () => {
  beforeEach(() => { store.clear(); vi.resetModules() })

  it('generateIntakeToken creates record with 7-day expiry', async () => {
    const { generateIntakeToken } = await import('@/lib/intake/tokens')
    const token = await generateIntakeToken({ eventId: 'evt_1', productSlug: 'infra-audit', customerEmail: 'a@b.com', customerName: 'A' })
    const r = store.get(token)
    expect(r).toBeDefined()
    expect(r!.expiresAt.getTime() - Date.now()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000)
  })

  it('validateIntakeToken returns valid:true for fresh token', async () => {
    const { generateIntakeToken, validateIntakeToken } = await import('@/lib/intake/tokens')
    const t = await generateIntakeToken({ eventId: 'evt_2', productSlug: 'infra-audit', customerEmail: 'b@c.com', customerName: 'B' })
    expect((await validateIntakeToken(t)).valid).toBe(true)
  })

  it('validateIntakeToken returns valid:false for used token', async () => {
    const { generateIntakeToken, validateIntakeToken, markTokenUsed } = await import('@/lib/intake/tokens')
    const t = await generateIntakeToken({ eventId: 'evt_3', productSlug: 'infra-audit', customerEmail: 'c@d.com', customerName: 'C' })
    await markTokenUsed(t)
    expect((await validateIntakeToken(t)).valid).toBe(false)
  })

  it('validateIntakeToken returns valid:false for expired token', async () => {
    const { generateIntakeToken, validateIntakeToken } = await import('@/lib/intake/tokens')
    const t = await generateIntakeToken({ eventId: 'evt_4', productSlug: 'infra-audit', customerEmail: 'd@e.com', customerName: 'D' })
    const r = store.get(t); if (r) r.expiresAt = new Date(Date.now() - 1000)
    expect((await validateIntakeToken(t)).valid).toBe(false)
  })

  it('markTokenUsed sets usedAt', async () => {
    const { generateIntakeToken, markTokenUsed } = await import('@/lib/intake/tokens')
    const t = await generateIntakeToken({ eventId: 'evt_5', productSlug: 'infra-audit', customerEmail: 'e@f.com', customerName: 'E' })
    await markTokenUsed(t)
    expect(store.get(t)?.usedAt).toBeInstanceOf(Date)
  })
})
