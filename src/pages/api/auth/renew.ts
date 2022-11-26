import { getPlayerById } from '@/app/auth'
import { generatePlayerToken, verifyTokenFromRequest } from '@/app/player-token'
import { createEndpoint } from '@/packlets/next-endpoint'
import createHttpError from 'http-errors'

export default createEndpoint({}).handler(async ({ input, req }) => {
  const result = await verifyTokenFromRequest(req)
  const player = await getPlayerById(result.playerId)
  if (!player) {
    throw createHttpError.Unauthorized(
      'Unable to resolve the player from the token',
    )
  }
  const playerToken = await generatePlayerToken(player, result.signedInAt)
  return { playerToken }
})
