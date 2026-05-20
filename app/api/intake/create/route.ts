import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateIntakeToken } from '@/lib/intake/tokens'

const CreateSchema = z.object({
  eventId: z.string(),
  productSlug: z.string(),
  customerEmail: z.string().email(),
  customerName: z.string(),
})

/**
 * Internal-only endpoint for generating intake tokens.
 * Requires X-Internal-API-Key header.
 * Primarily called by the webhook route directly — this endpoint is a
 * convenience escape hatch for Make or admin use.
 */
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

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const token = await generateIntakeToken(parsed.data)
  const intakeUrl = `${process.env.NEXTAUTH_URL ?? ''}/intake/${token}`

  return NextResponse.json({ token, intakeUrl })
}
