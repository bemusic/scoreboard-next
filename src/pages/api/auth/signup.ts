import { createEndpoint } from '@/packlets/next-endpoint'
import { generatePlayerToken } from '@/app/player-token'
import { Email, Password, signUpPlayer, Username } from '@/app/auth'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    username: Username,
    password: Password,
    email: Email,
  }),
}).handler(async ({ input }) => {
  const { username, password, email } = input
  const player = await signUpPlayer(username, password, email)
  const playerToken = await generatePlayerToken(player)
  return {
    playerToken,
    playerName: player.playerName,
    playerId: player._id,
  }
})
