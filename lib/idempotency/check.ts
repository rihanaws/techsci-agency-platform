import { Prisma, PrismaClient } from '@prisma/client'

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
  try {
    await prisma.whopProcessedEvent.create({
      data: { eventId, productSlug, customerEmail },
    })
  } catch (err) {
    if (err instanceof Error && isUniqueConstraintError(err)) return
    throw err
  }
}

function isUniqueConstraintError(
  err: Error,
): err is Prisma.PrismaClientKnownRequestError {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  )
}
