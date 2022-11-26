import { resolvePlayerId } from '@/app/player-token'
import { getMyRecords } from '@/app/scoreboard'
import { createEndpoint } from '@/packlets/next-endpoint'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    md5s: z.array(z.string()),
  }),
}).handler(async ({ input, req }) => {
  const playerId = await resolvePlayerId(req)
  const md5s = input.md5s
  return getMyRecords(md5s, playerId)
})
