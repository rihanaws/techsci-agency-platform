import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateAuditReport } from '@/lib/claude/audit'
import { generateAuditHtml } from '@/lib/doppio/templates'
import { htmlToPdf } from '@/lib/doppio/pdf'
import { uploadToR2 } from '@/lib/r2/upload'
import { generatePresignedUrls } from '@/lib/r2/presign'
import { notifyOwner } from '@/lib/telegram/notify'

const BodySchema = z.object({
  eventId: z.string().min(1),
  formData: z.record(z.string(), z.unknown()),
})

/**
 * Direct Claude audit generation — bypasses Make Scenario A2.
 * Admin bypass or fallback if Make is unreachable.
 * Requires X-Internal-API-Key.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('x-internal-api-key') !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }) }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { eventId, formData } = parsed.data

  try {
    const auditData = await generateAuditReport(formData)
    const html = generateAuditHtml(auditData)
    const pdfBuffer = await htmlToPdf(html)
    const r2Key = `audits/${eventId}/audit-${Date.now()}.pdf`
    await uploadToR2(pdfBuffer, r2Key)
    const urls = await generatePresignedUrls([r2Key])
    await notifyOwner(`✅ Direct audit generated for event <code>${eventId}</code>`)
    return NextResponse.json({ success: true, downloadUrl: urls[0], r2Key })
  } catch (err) {
    console.error('[audit/generate] Failed', err)
    await notifyOwner(`❌ Direct audit failed for <code>${eventId}</code>: ${(err as Error).message}`)
    return NextResponse.json({ error: 'generation_failed', details: (err as Error).message }, { status: 500 })
  }
}
