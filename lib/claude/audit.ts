import { getAnthropicClient, CLAUDE_MODEL } from './client'

export interface AuditOutput {
  executiveSummary: string
  riskScore: number  // 0–100
  sections: Array<{
    title: string
    findings: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    recommendations: string[]
  }>
  roadmap: Array<{
    priority: 'P0' | 'P1' | 'P2'
    action: string
    estimatedEffort: string
  }>
}

const AUDIT_SYSTEM_PROMPT = `You are a senior infrastructure security auditor.
Return ONLY valid JSON matching this exact structure — no markdown, no prose, no code fences:
{
  "executiveSummary": "string (2-3 sentences)",
  "riskScore": number (0-100),
  "sections": [{"title":"string","findings":["string"],"severity":"low|medium|high|critical","recommendations":["string"]}],
  "roadmap": [{"priority":"P0|P1|P2","action":"string","estimatedEffort":"string"}]
}`

export async function generateAuditReport(formData: Record<string, unknown>): Promise<AuditOutput> {
  const anthropic = getAnthropicClient()

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this infrastructure and return the audit JSON:\n\n${JSON.stringify(formData, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(raw) as AuditOutput
  } catch {
    // Strip accidental markdown fences if Claude added them
    const stripped = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(stripped) as AuditOutput
  }
}
