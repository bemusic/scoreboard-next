import { PlayerCollection } from '@/db'
import { createLogger } from '@/packlets/logger'
import { createEndpoint } from '@/packlets/next-endpoint'

const logger = createLogger('api/dev/seed')

export default createEndpoint({}).handler(async ({ input }) => {
  const log: string[] = []

  const seedPlayer = async (
    id: string,
    playerName: string,
    linkedTo?: string,
  ) => {
    const result = await PlayerCollection.updateOne(
      { playerName },
      { $setOnInsert: { playerName, _id: id, linkedTo } },
      { upsert: true },
    )
    if (result.upsertedCount > 0) {
      log.push(`Player created: ${playerName}`)
    } else {
      log.push(`Player already exists: ${playerName}`)
    }
  }

  await seedPlayer(
    '19b01549-317d-465f-8f34-277357054b90',
    'BemuseTester1',
    'auth0|6356ee23284d38dfe27d3e7d',
  )
  logger.info({ log: log.join('\n') }, 'Seed data created.')

  return { result: log }
})
