import { z } from 'zod'
import { createEndpoint } from '@/packlets/next-endpoint'
import { generatePlayerToken } from '@/app/player-token'
import { authenticatePlayer } from '@/app/auth'

const Username = z.union([
  z
    .string()
    .min(1)
    .max(32)
    .regex(/^(?:test!)?[a-zA-Z0-9_]+$/),
  z.string().email(),
])

const Password = z.string().min(6)

export default createEndpoint({
  input: z.object({
    username: Username,
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
