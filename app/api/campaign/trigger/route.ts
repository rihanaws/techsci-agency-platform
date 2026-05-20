import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { forwardToMake } from '@/lib/make/forward'

const CampaignSchema = z.object({
  campaignName: z.string().min(1),
  productSlug: z.string().min(1),
  productUrl: z.string().url(),
  launchPrice: z.number().int().positive(),
  regularPrice: z.number().int().positive(),
  offerExpiry: z.string().datetime(),
  targetAudience: z.string().min(1),
  keyBenefit: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = CampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const makeUrl = process.env.MAKE_WEBHOOK_URL_SCENARIO_F
  if (!makeUrl) {
    console.error('[campaign/trigger] MAKE_WEBHOOK_URL_SCENARIO_F not set')
    return NextResponse.json({ error: 'MAKE_WEBHOOK_URL_SCENARIO_F not set' }, { status: 500 })
  }

  const forwarded = await forwardToMake(parsed.data, makeUrl)
  return NextResponse.json({ success: forwarded })
}
