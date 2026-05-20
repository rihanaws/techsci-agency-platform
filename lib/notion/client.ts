import { Client } from '@notionhq/client'

const globalForNotion = globalThis as unknown as { notion?: Client }

export function getNotionClient(): Client {
  if (globalForNotion.notion) return globalForNotion.notion

  const client = new Client({ auth: process.env.NOTION_API_KEY! })

  if (process.env.NODE_ENV !== 'production') globalForNotion.notion = client
  return client
}
