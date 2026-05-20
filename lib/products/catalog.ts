export const PRODUCT_CATALOG = {
  'ai-agent-pack': {
    name: 'AI Agent Pack — Full Library',
    price: 4900,
    type: 'zip' as const,
    r2Keys: ['ai-agent-pack/ai-agent-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'claude-code-agent-pack': {
    name: 'Claude Code Agent Pack',
    price: 7900,
    type: 'zip' as const,
    r2Keys: ['claude-code-agent-pack/claude-code-agent-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'devops-starter-kit': {
    name: 'DevOps Starter Kit',
    price: 5900,
    type: 'zip' as const,
    r2Keys: ['devops-starter-kit/devops-starter-kit-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'make-scenario-pack': {
    name: 'Make.com Automation Scenario Pack',
    price: 7900,
    type: 'zip' as const,
    r2Keys: ['make-scenario-pack/make-scenario-pack-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'whop-agency-kit': {
    name: 'Whop Agency Setup Kit',
    price: 9900,
    type: 'zip' as const,
    r2Keys: ['whop-agency-kit/whop-agency-kit-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'infra-audit': {
    name: 'AI Infrastructure Audit',
    price: 9900,
    type: 'intake' as const,
    r2Keys: [] as string[],
    emailTemplate: 'intake-link' as const,
  },
  'saas-boilerplate': {
    name: 'Next.js 15 SaaS Boilerplate',
    price: 14900,
    type: 'zip' as const,
    r2Keys: ['saas-boilerplate/nextjs15-saas-boilerplate-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'automation-spec-doc': {
    name: 'Automation Spec Doc',
    price: 5900,
    type: 'intake' as const,
    r2Keys: [] as string[],
    emailTemplate: 'intake-link' as const,
  },
  'community': {
    name: 'Autonomous Founder Systems Community',
    price: 2900,
    type: 'subscription' as const,
    r2Keys: [] as string[],
    emailTemplate: 'welcome' as const,
  },
  'managed-devops': {
    name: 'Managed DevOps Monthly Report',
    price: 19900,
    type: 'subscription-intake' as const,
    r2Keys: [] as string[],
    emailTemplate: 'intake-link' as const,
  },
  'notion-founder-os': {
    name: 'Notion Founder OS Template',
    price: 2900,
    type: 'zip' as const,
    r2Keys: ['notion-founder-os/notion-founder-os-v1.zip'],
    emailTemplate: 'delivery' as const,
  },
  'automation-launch-bundle': {
    name: 'Automation Launch Bundle',
    price: 24900,
    type: 'bundle' as const,
    r2Keys: [
      'saas-boilerplate/nextjs15-saas-boilerplate-v1.zip',
      'ai-agent-pack/ai-agent-pack-v1.zip',
      'make-scenario-pack/make-scenario-pack-v1.zip',
      'devops-starter-kit/devops-starter-kit-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
  'agency-operator-bundle': {
    name: 'Agency Operator Bundle',
    price: 14900,
    type: 'bundle' as const,
    r2Keys: [
      'whop-agency-kit/whop-agency-kit-v1.zip',
      'make-scenario-pack/make-scenario-pack-v1.zip',
      'ai-agent-pack/ai-agent-pack-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
  'developer-ai-toolkit': {
    name: 'Developer AI Toolkit',
    price: 12900,
    type: 'bundle' as const,
    r2Keys: [
      'claude-code-agent-pack/claude-code-agent-pack-v1.zip',
      'devops-starter-kit/devops-starter-kit-v1.zip',
      'saas-boilerplate/nextjs15-saas-boilerplate-v1.zip',
    ],
    emailTemplate: 'bundle-delivery' as const,
  },
} as const

export type ProductSlug = keyof typeof PRODUCT_CATALOG
export type ProductType = (typeof PRODUCT_CATALOG)[ProductSlug]['type']

export const INTAKE_SLUGS = new Set<ProductSlug>(['infra-audit', 'automation-spec-doc', 'managed-devops'])
export const SUBSCRIPTION_SLUGS = new Set<ProductSlug>(['community', 'managed-devops'])
