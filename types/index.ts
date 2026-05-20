// Shared types used across the platform

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
  intakeToken: string | null
  createdAt: string
}

export interface MakeForwardPayload {
  source: 'whop' | 'agency-intake'
  receivedAt: string
  purchase: NormalizedPurchase
}

export interface IntakeSubmitPayload {
  source: 'agency-intake'
  productSlug: string
  eventId: string
  customerEmail: string
  customerName: string
  formData: Record<string, unknown>
}

export interface CampaignPayload {
  campaignName: string
  productSlug: string
  productUrl: string
  launchPrice: number
  regularPrice: number
  offerExpiry: string
  targetAudience: string
  keyBenefit: string
}

export type ProductType = 'zip' | 'bundle' | 'intake' | 'subscription' | 'subscription-intake'
export type EmailTemplate = 'delivery' | 'bundle-delivery' | 'intake-link' | 'welcome'
