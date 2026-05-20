import { z } from 'zod'

export const WhopUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
})

export const WhopProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
})

export const WhopMembershipSchema = z.object({
  id: z.string(),
  user: WhopUserSchema,
  product: WhopProductSchema,
  order_value: z.string(),
  currency: z.string().default('usd'),
  status: z.string(),
  created_at: z.number(),
  renewal_period_end: z.number().nullable().optional(),
})

export const WhopWebhookEventSchema = z.object({
  event_id: z.string(),
  action: z.enum([
    'payment.succeeded',
    'membership.went_valid',
    'membership.went_invalid',
    'membership.went_overdue',
    'payment.refunded',
  ]),
  data: z.object({
    object: WhopMembershipSchema,
  }),
})

export type WhopWebhookEvent = z.infer<typeof WhopWebhookEventSchema>
export type WhopUser = z.infer<typeof WhopUserSchema>
export type WhopProduct = z.infer<typeof WhopProductSchema>
export type WhopMembership = z.infer<typeof WhopMembershipSchema>
