import { createEndpoint } from '@/packlets/next-endpoint'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default createEndpoint({}).handler(async ({ input }) => {
  const count = await prisma.rankingEntry.count()
  return { message: `There are ${count} ranking entries!` }
})
