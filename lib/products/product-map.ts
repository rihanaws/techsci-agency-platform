import type { ProductSlug } from './catalog'

function envId(key: string): string {
  const val = process.env[key]
  if (!val) console.warn(`[product-map] Missing env var: ${key}`)
  return val ?? `__missing_${key}__`
}

function buildMap(): Record<string, ProductSlug> {
  return {
    [envId('WHOP_PRODUCT_ID_AI_AGENT_PACK')]:             'ai-agent-pack',
    [envId('WHOP_PRODUCT_ID_CLAUDE_CODE_PACK')]:          'claude-code-agent-pack',
    [envId('WHOP_PRODUCT_ID_DEVOPS_STARTER_KIT')]:        'devops-starter-kit',
    [envId('WHOP_PRODUCT_ID_MAKE_SCENARIO_PACK')]:        'make-scenario-pack',
    [envId('WHOP_PRODUCT_ID_WHOP_AGENCY_KIT')]:           'whop-agency-kit',
    [envId('WHOP_PRODUCT_ID_INFRA_AUDIT')]:               'infra-audit',
    [envId('WHOP_PRODUCT_ID_SAAS_BOILERPLATE')]:          'saas-boilerplate',
    [envId('WHOP_PRODUCT_ID_AUTOMATION_SPEC_DOC')]:       'automation-spec-doc',
    [envId('WHOP_PRODUCT_ID_COMMUNITY')]:                 'community',
    [envId('WHOP_PRODUCT_ID_MANAGED_DEVOPS')]:            'managed-devops',
    [envId('WHOP_PRODUCT_ID_NOTION_FOUNDER_OS')]:         'notion-founder-os',
    [envId('WHOP_PRODUCT_ID_AUTOMATION_LAUNCH_BUNDLE')]:  'automation-launch-bundle',
    [envId('WHOP_PRODUCT_ID_AGENCY_OPERATOR_BUNDLE')]:    'agency-operator-bundle',
    [envId('WHOP_PRODUCT_ID_DEVELOPER_AI_TOOLKIT')]:      'developer-ai-toolkit',
  }
}

export function resolveProductSlug(whopProductId: string): ProductSlug {
  return (buildMap()[whopProductId] ?? 'unknown') as ProductSlug
}
