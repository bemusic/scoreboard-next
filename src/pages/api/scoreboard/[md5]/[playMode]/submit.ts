import { verifyPlayerToken } from '@/app/player-token'
import { createEndpoint } from '@/packlets/next-endpoint'
import createHttpError from 'http-errors'
import { NextApiRequest } from 'next'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    score: z.number().int().min(0).max(555555),
    combo: z.number().int().min(0),
    count: z.tuple([
      z.number().int().min(0),
      z.number().int().min(0),
      z.number().int().min(0),
      z.number().int().min(0),
      z.number().int().min(0),
    ]),
    total: z.number().int().min(0),
    log: z.string(),
  }),
}).handler(async ({ input, req }) => {
  const playerId = await resolvePlayerId(req)
  const md5 = String(req.query.md5)
  const playMode = String(req.query.playMode)
  return {}
})

/**
 * Resolve the player ID from the Next request by parsing the bearer token.
 */
async function resolvePlayerId(req: NextApiRequest) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw new createHttpError.Unauthorized('Missing bearer token')
  }
  try {
    const result = await verifyPlayerToken(token)
    return result.sub
  } catch (error) {
    throw new createHttpError.Unauthorized(`Invalid bearer token: ${error}`)
  }
}
