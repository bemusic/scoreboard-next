import { createEndpoint } from '@/packlets/next-endpoint'
import { getLeaderboard } from '@/scoreboard'

export default createEndpoint({}).handler(async ({ input, req }) => {
  const md5 = String(req.query.md5)
  const playMode = String(req.query.playMode)
  const max = Math.max(1, Math.min(50, +String(req.query.max) || 50))

  return getLeaderboard(md5, playMode, max)
})
