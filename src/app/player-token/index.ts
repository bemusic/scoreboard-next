import { PlayerDoc } from '@/db'
import { randomUUID } from 'crypto'
import createHttpError from 'http-errors'
import { SignJWT, jwtVerify } from 'jose'
import { NextApiRequest } from 'next'

/**
 * Generate a player token for a player.
 */
export async function generatePlayerToken(
  player: PlayerDoc,
  signedInAt = new Date().toISOString(),
) {
  return await new SignJWT({
    sub: player._id,
    playerName: player.playerName,
    signedInAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('14d')
    .setJti(randomUUID())
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
  return result.payload as {
    sub: string
    playerName: string
    signedInAt: string
  }
}

/**
 * Resolve the player ID from the Next request by parsing the bearer token.
 */
export async function resolvePlayerId(req: NextApiRequest) {
  const result = await verifyTokenFromRequest(req)
  return result.playerId
}

/**
 * Resolve the player ID from the Next request by parsing the bearer token.
 */
export async function verifyTokenFromRequest(req: NextApiRequest) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw new createHttpError.Unauthorized('Missing bearer token')
  }
  try {
    const result = await verifyPlayerToken(token)
    return {
      playerId: result.sub,
      signedInAt: result.signedInAt,
    }
  } catch (error) {
    throw new createHttpError.Unauthorized(`Invalid bearer token: ${error}`)
  }
}
