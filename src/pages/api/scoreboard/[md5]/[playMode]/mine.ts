import { getMyRecord } from '@/app/scoreboard'
import { createEndpoint } from '@/packlets/next-endpoint'

export default createEndpoint({}).handler(async ({ input, req }) => {
  const md5 = String(req.query.md5)
  const playMode = String(req.query.playMode)

  return getMyRecord(md5, playMode)
})
