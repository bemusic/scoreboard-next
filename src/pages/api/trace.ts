import { RankingEntryCollection } from '@/db'
import { createEndpoint } from '@/packlets/next-endpoint'

export default createEndpoint({}).handler(async ({ input }) => {
  const count = await RankingEntryCollection.estimatedDocumentCount()
  return { message: `There are ${count} ranking entries!` }
})
