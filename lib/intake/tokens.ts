import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const TOKEN_TTL_DAYS = 7

export async function generateIntakeToken(params: {
  eventId: string
  productSlug: string
  customerEmail: string
  customerName: string
}): Promise<string> {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.whopIntakeToken.create({
    data: { token, expiresAt, ...params },
  })

  return token
}

export async function validateIntakeToken(token: string): Promise<{
  valid: boolean
  record?: {
    eventId: string
    productSlug: string
    customerEmail: string
    customerName: string
    usedAt: Date | null
    expiresAt: Date
  }
}> {
  const record = await prisma.whopIntakeToken.findUnique({ where: { token } })
  if (!record) return { valid: false }
  if (record.usedAt) return { valid: false, record }  // already used
  if (record.expiresAt < new Date()) return { valid: false, record }  // expired
  return { valid: true, record }
}

export async function markTokenUsed(token: string): Promise<void> {
  await prisma.whopIntakeToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })
}
