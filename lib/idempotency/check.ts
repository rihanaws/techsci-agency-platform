import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function isEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.whopProcessedEvent.findUnique({
    where: { eventId },
    select: { eventId: true },
  })
  return existing !== null
}

export async function markEventProcessed(
  eventId: string,
  productSlug: string,
  customerEmail: string,
): Promise<void> {
  await prisma.whopProcessedEvent.create({
    data: { eventId, productSlug, customerEmail },
  })
}
