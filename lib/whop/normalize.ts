import type { WhopWebhookEvent } from './types'
import { resolveProductSlug } from '../products/product-map'

export interface NormalizedPurchase {
  eventId: string
  eventType: string
  membershipId: string
  productId: string
  productSlug: string
  customerEmail: string
  customerName: string
  customerId: string
  amount: number        // cents
  currency: string
  isSubscription: boolean
  intakeToken: string | null   // UUID for intake products, null for ZIP/subscription
  createdAt: string
}

export function normalizeWhopEvent(event: WhopWebhookEvent): NormalizedPurchase {
  const membership = event.data.object
  const product = membership.product
  const user = membership.user
  const productSlug = resolveProductSlug(product.id)

  const amountCents = Math.round(parseFloat(membership.order_value || '0') * 100)
  const isSubscription = !!(membership.renewal_period_end)

  return {
    eventId:       event.event_id,
    eventType:     event.action,
    membershipId:  membership.id,
    productId:     product.id,
    productSlug,
    customerEmail: user.email,
    customerName:  user.name ?? user.username,
    customerId:    user.id,
    amount:        amountCents,
    currency:      membership.currency.toLowerCase(),
    isSubscription,
    intakeToken:   null, // Set in route handler after token is generated
    createdAt:     new Date(membership.created_at * 1000).toISOString(),
  }
}
