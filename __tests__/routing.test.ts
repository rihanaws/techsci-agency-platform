import { describe, it, expect } from 'vitest'
import { PRODUCT_CATALOG, INTAKE_SLUGS, SUBSCRIPTION_SLUGS } from '@/lib/products/catalog'

describe('Product catalog routing', () => {
  const slugs = Object.keys(PRODUCT_CATALOG) as Array<keyof typeof PRODUCT_CATALOG>

  it('has exactly 14 slugs', () => { expect(slugs).toHaveLength(14) })

  it('every slug has a defined type', () => {
    for (const s of slugs) expect(PRODUCT_CATALOG[s].type).toBeDefined()
  })

  it('zip products have non-empty r2Keys', () => {
    for (const s of slugs)
      if (PRODUCT_CATALOG[s].type === 'zip')
        expect((PRODUCT_CATALOG[s].r2Keys as string[]).length).toBeGreaterThan(0)
  })

  it('bundle products have multiple r2Keys', () => {
    for (const s of slugs)
      if (PRODUCT_CATALOG[s].type === 'bundle')
        expect((PRODUCT_CATALOG[s].r2Keys as string[]).length).toBeGreaterThan(1)
  })

  it('intake/subscription products have empty r2Keys', () => {
    for (const s of slugs) {
      const t = PRODUCT_CATALOG[s].type
      if (t === 'intake' || t === 'subscription' || t === 'subscription-intake')
        expect((PRODUCT_CATALOG[s].r2Keys as string[]).length).toBe(0)
    }
  })

  it('INTAKE_SLUGS has exactly 3 products', () => {
    expect(INTAKE_SLUGS.size).toBe(3)
    expect(INTAKE_SLUGS.has('infra-audit')).toBe(true)
    expect(INTAKE_SLUGS.has('automation-spec-doc')).toBe(true)
    expect(INTAKE_SLUGS.has('managed-devops')).toBe(true)
  })

  it('SUBSCRIPTION_SLUGS has exactly 2 products', () => {
    expect(SUBSCRIPTION_SLUGS.size).toBe(2)
    expect(SUBSCRIPTION_SLUGS.has('community')).toBe(true)
    expect(SUBSCRIPTION_SLUGS.has('managed-devops')).toBe(true)
  })
})
