import { resolvePlayerId } from '@/app/player-token'
import { getMyRecord } from '@/app/scoreboard'
import { createEndpoint } from '@/packlets/next-endpoint'

export default createEndpoint({}).handler(async ({ input, req }) => {
  const playerId = await resolvePlayerId(req)
  const md5 = String(req.query.md5)
  const playMode = String(req.query.playMode)
  return getMyRecord(md5, playMode, playerId)
})
