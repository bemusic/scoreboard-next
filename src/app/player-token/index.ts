import { PlayerDoc } from '@/db'
import { SignJWT, jwtVerify } from 'jose'

/**
 * Generate a player token for a player.
 */
export async function generatePlayerToken(player: PlayerDoc) {
  return await new SignJWT({ sub: player._id, playerName: player.playerName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .sign(Buffer.from(process.env.PLAYER_TOKEN_SECRET!))
}

/**
 * Decode and verify a player token.
 */
export async function verifyPlayerToken(token: string) {
  const result = await jwtVerify(
    token,
    Buffer.from(process.env.PLAYER_TOKEN_SECRET!),
  )
  return result.payload as { sub: string; playerName: string }
}
