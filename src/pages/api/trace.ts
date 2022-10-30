import { createEndpoint } from '@/packlets/next-endpoint'
import { prisma } from '@/packlets/prisma-client'

export default createEndpoint({}).handler(async ({ input }) => {
  const count = await prisma.rankingEntry.count()
  return { message: `There are ${count} ranking entries!` }
})
