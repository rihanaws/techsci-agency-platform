import { getAnthropicClient, CLAUDE_MODEL } from './client'

export interface SpecOutput {
  processName: string
  scenarioTitle: string
  triggerType: 'webhook' | 'schedule' | 'manual'
  modules: Array<{
    order: number
    app: string
    action: string
    inputs: string[]
    outputs: string[]
  }>
  apiRequirements: string[]
  buildEstimate: string
  caveats: string[]
}

const SPEC_SYSTEM_PROMPT = `You are a Make.com automation architect.
Return ONLY valid JSON matching this exact structure — no markdown, no prose:
{
  "processName": "string",
  "scenarioTitle": "string",
  "triggerType": "webhook|schedule|manual",
  "modules": [{"order":1,"app":"string","action":"string","inputs":["string"],"outputs":["string"]}],
  "apiRequirements": ["string"],
  "buildEstimate": "string",
  "caveats": ["string"]
}`

export async function generateAutomationSpec(formData: Record<string, unknown>): Promise<SpecOutput> {
  const anthropic = getAnthropicClient()

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: SPEC_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate a Make.com automation specification for this process:\n\n${JSON.stringify(formData, null, 2)}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(raw) as SpecOutput
  } catch {
    const stripped = raw.replace(/```json|```/g, '').trim()
    return JSON.parse(stripped) as SpecOutput
  }
}
