import { getNotionClient } from './client'
import type { Client } from '@notionhq/client'

export type OrderStatus =
  | 'fulfilled'
  | 'awaiting_intake'
  | 'awaiting_onboarding'
  | 'routing_failed'

export interface OrderRecord {
  eventId: string
  productSlug: string
  customerEmail: string
  customerName: string
  amount: number
  currency: string
  status: OrderStatus
  createdAt: string
}

export interface NotionOrder {
  id: string
  eventId: string
  productSlug: string
  customerEmail: string
  customerName: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

// Typed wrappers around Notion's dynamic API to avoid `any`
type NotionClient = Client & {
  pages: {
    create(params: unknown): Promise<unknown>
    update(params: unknown): Promise<unknown>
  }
  databases: {
    query(params: unknown): Promise<{
      results: Array<{
        id: string
        properties: Record<string, unknown>
      }>
      has_more: boolean
      next_cursor: string | null
    }>
  }
}

function extractTitle(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { title?: Array<{ text: { content: string } }> } | undefined
  return p?.title?.[0]?.text?.content ?? ''
}

function extractRichText(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { rich_text?: Array<{ text: { content: string } }> } | undefined
  return p?.rich_text?.[0]?.text?.content ?? ''
}

function extractEmail(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { email?: string | null } | undefined
  return p?.email ?? ''
}

function extractNumber(props: Record<string, unknown>, key: string): number {
  const p = props[key] as { number?: number | null } | undefined
  return p?.number ?? 0
}

function extractSelect(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { select?: { name: string } | null } | undefined
  return p?.select?.name ?? ''
}

function extractDate(props: Record<string, unknown>, key: string): string {
  const p = props[key] as { date?: { start: string } | null } | undefined
  return p?.date?.start ?? ''
}

function mapPageToOrder(page: { id: string; properties: Record<string, unknown> }): NotionOrder {
  const props = page.properties
  return {
    id: page.id,
    eventId: extractTitle(props, 'Event ID'),
    productSlug: extractRichText(props, 'Product'),
    customerEmail: extractEmail(props, 'Customer Email'),
    customerName: extractRichText(props, 'Customer Name'),
    amount: extractNumber(props, 'Amount'),
    currency: extractRichText(props, 'Currency') || 'usd',
    status: extractSelect(props, 'Status'),
    createdAt: extractDate(props, 'Created At'),
  }
}

export async function logOrder(order: OrderRecord): Promise<void> {
  const notion = getNotionClient() as NotionClient
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) { console.warn('[notion/orders] NOTION_ORDERS_DB_ID not set'); return }

  try {
    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        'Event ID': { title: [{ text: { content: order.eventId } }] },
        'Product': { rich_text: [{ text: { content: order.productSlug } }] },
        'Customer Email': { email: order.customerEmail },
        'Customer Name': { rich_text: [{ text: { content: order.customerName } }] },
        'Amount': { number: order.amount },
        'Currency': { rich_text: [{ text: { content: order.currency } }] },
        'Status': { select: { name: order.status } },
        'Created At': { date: { start: order.createdAt } },
      },
    })
  } catch (err) {
    console.error('[notion/orders] logOrder failed', { error: (err as Error).message })
  }
}

export async function updateOrderStatus(eventId: string, status: OrderStatus): Promise<void> {
  const notion = getNotionClient() as NotionClient
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      filter: { property: 'Event ID', title: { equals: eventId } },
    })
    const page = response.results[0]
    if (!page) { console.warn(`[notion/orders] No page found for eventId: ${eventId}`); return }
    await notion.pages.update({ page_id: page.id, properties: { 'Status': { select: { name: status } } } })
  } catch (err) {
    console.error('[notion/orders] updateOrderStatus failed', { error: (err as Error).message })
  }
}

export async function getRecentOrders(limit = 20): Promise<NotionOrder[]> {
  const notion = getNotionClient() as NotionClient
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return []

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Created At', direction: 'descending' }],
      page_size: limit,
    })
    return response.results.map(mapPageToOrder)
  } catch (err) {
    console.error('[notion/orders] getRecentOrders failed', { error: (err as Error).message })
    return []
  }
}

export async function getOrdersByPage(
  pageSize = 20,
  cursor?: string,
): Promise<{ orders: NotionOrder[]; nextCursor: string | null }> {
  const notion = getNotionClient() as NotionClient
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return { orders: [], nextCursor: null }

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Created At', direction: 'descending' }],
      page_size: pageSize,
      ...(cursor ? { start_cursor: cursor } : {}),
    })
    return {
      orders: response.results.map(mapPageToOrder),
      nextCursor: response.has_more ? (response.next_cursor ?? null) : null,
    }
  } catch (err) {
    console.error('[notion/orders] getOrdersByPage failed', { error: (err as Error).message })
    return { orders: [], nextCursor: null }
  }
}
