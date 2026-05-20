import { getNotionClient } from './client'

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

export async function logOrder(order: OrderRecord): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notion = getNotionClient() as any
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) {
    console.warn('[notion/orders] NOTION_ORDERS_DB_ID not set — skipping log')
    return
  }

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

export async function updateOrderStatus(
  eventId: string,
  status: OrderStatus,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notion = getNotionClient() as any
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return

  try {
    // Query for the page with matching Event ID
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: 'Event ID',
        title: { equals: eventId },
      },
    })

    const page = response.results[0]
    if (!page) {
      console.warn(`[notion/orders] No page found for eventId: ${eventId}`)
      return
    }

    await notion.pages.update({
      page_id: page.id,
      properties: {
        'Status': { select: { name: status } },
      },
    })
  } catch (err) {
    console.error('[notion/orders] updateOrderStatus failed', { error: (err as Error).message })
  }
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

export async function getRecentOrders(limit = 20): Promise<NotionOrder[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notion = getNotionClient() as any
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return []

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Created At', direction: 'descending' }],
      page_size: limit,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: any) => {
      const props = page.properties
      return {
        id: page.id,
        eventId: props['Event ID']?.title?.[0]?.text?.content ?? '',
        productSlug: props['Product']?.rich_text?.[0]?.text?.content ?? '',
        customerEmail: props['Customer Email']?.email ?? '',
        customerName: props['Customer Name']?.rich_text?.[0]?.text?.content ?? '',
        amount: props['Amount']?.number ?? 0,
        currency: props['Currency']?.rich_text?.[0]?.text?.content ?? 'usd',
        status: props['Status']?.select?.name ?? '',
        createdAt: props['Created At']?.date?.start ?? '',
      }
    })
  } catch (err) {
    console.error('[notion/orders] getRecentOrders failed', { error: (err as Error).message })
    return []
  }
}

export async function getOrdersByPage(
  pageSize = 20,
  cursor?: string,
): Promise<{ orders: NotionOrder[]; nextCursor: string | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notion = getNotionClient() as any
  const dbId = process.env.NOTION_ORDERS_DB_ID
  if (!dbId) return { orders: [], nextCursor: null }

  try {
    const response = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: 'Created At', direction: 'descending' }],
      page_size: pageSize,
      ...(cursor ? { start_cursor: cursor } : {}),
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = response.results.map((page: any) => {
      const props = page.properties
      return {
        id: page.id,
        eventId: props['Event ID']?.title?.[0]?.text?.content ?? '',
        productSlug: props['Product']?.rich_text?.[0]?.text?.content ?? '',
        customerEmail: props['Customer Email']?.email ?? '',
        customerName: props['Customer Name']?.rich_text?.[0]?.text?.content ?? '',
        amount: props['Amount']?.number ?? 0,
        currency: props['Currency']?.rich_text?.[0]?.text?.content ?? 'usd',
        status: props['Status']?.select?.name ?? '',
        createdAt: props['Created At']?.date?.start ?? '',
      }
    })

    return {
      orders,
      nextCursor: response.has_more ? (response.next_cursor ?? null) : null,
    }
  } catch (err) {
    console.error('[notion/orders] getOrdersByPage failed', { error: (err as Error).message })
    return { orders: [], nextCursor: null }
  }
}
