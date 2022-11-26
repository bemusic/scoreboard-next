import { createEndpoint } from '@/packlets/next-endpoint'
import { generatePlayerToken } from '@/app/player-token'
import { authenticatePlayer, Password, UsernameOrEmail } from '@/app/auth'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    username: UsernameOrEmail,
    password: Password,
  }),
}).handler(async ({ input }) => {
  const { username, password } = input
  const player = await authenticatePlayer(username, password)
  const playerToken = await generatePlayerToken(player)
  return {
    playerToken,
    playerName: player.playerName,
    playerId: player._id,
  }
})
