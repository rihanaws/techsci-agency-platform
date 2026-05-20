import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generatePresignedUrl, generatePresignedUrls } from '@/lib/r2/presign'

const BodySchema = z
  .object({
    r2Key: z.string().optional(),
    r2Keys: z.array(z.string()).optional(),
  })
  .refine((d) => d.r2Key ?? d.r2Keys, { message: 'r2Key or r2Keys required' })

const TTL_MS = 48 * 60 * 60 * 1000 // 48h in ms

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Internal-only: require API key
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { r2Key, r2Keys } = parsed.data
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString()

  try {
    if (r2Keys) {
      const urls = await generatePresignedUrls(r2Keys)
      return NextResponse.json({ urls, expiresAt })
    }

    const url = await generatePresignedUrl(r2Key!)
    return NextResponse.json({ url, expiresAt })
  } catch (err) {
    console.error('[r2/presign] Failed to generate presigned URL', err)
    return NextResponse.json({ error: 'presign_failed' }, { status: 500 })
  }
}
