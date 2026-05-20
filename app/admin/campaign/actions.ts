'use server'

import { forwardToMake } from '@/lib/make/forward'
import { revalidatePath } from 'next/cache'

export interface CampaignData {
  campaignName: string
  productSlug: string
  productUrl: string
  launchPrice: number // cents
  regularPrice: number // cents
  offerExpiry: string // ISO string
  targetAudience: string
  keyBenefit: string
}

export async function triggerCampaign(data: CampaignData) {
  const makeUrl = process.env.MAKE_WEBHOOK_URL_SCENARIO_F
  if (!makeUrl) {
    return { success: false, error: 'MAKE_WEBHOOK_URL_SCENARIO_F not set' }
  }

  try {
    const forwarded = await forwardToMake(data, makeUrl)
    if (!forwarded) {
      return { success: false, error: 'Failed to forward to Make' }
    }
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('Trigger campaign failed', err)
    return { success: false, error: (err as Error).message }
  }
}
