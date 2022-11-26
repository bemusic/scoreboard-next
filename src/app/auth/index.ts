import { z } from 'zod'
import axios from 'axios'
import createHttpError from 'http-errors'
import { randomUUID } from 'crypto'
import { decodeJwt } from 'jose'
import { PlayerCollection } from '@/db'
import { handleAxiosError, isAxiosError } from '@/packlets/handle-axios-error'
import { createLogger } from '@/packlets/logger'

const logger = createLogger('auth')

export const Username = z
  .string()
  .min(1)
  .max(32)
  .regex(/^(?:test!)?[a-zA-Z0-9_]+$/)

export const UsernameOrEmail = z.union([Username, z.string().email()])

export const Password = z.string().min(6)

export async function authenticatePlayer(username: string, password: string) {
  // For test accounts, use a hardcoded password.
  if (username.startsWith('test!')) {
    if (password !== process.env.TEST_USER_PASSWORD) {
      throw new createHttpError.Unauthorized('Invalid password')
    }
    const result = await PlayerCollection.findOneAndUpdate(
      { playerName: username },
      {
        $setOnInsert: {
          _id: randomUUID(),
          playerName: username,
        },
      },
      { upsert: true, returnDocument: 'after' },
    )
    if (!result.value) {
      throw new createHttpError.InternalServerError('Failed to create player')
    }
    return result.value
  }

  // Auth0 has a username validation logic that is not compatible with Bemuse,
  // so instead of storing the username in Auth0, we store arbitrarily generated
  // UUIDs in the username field.
  const auth0Username = await resolveAuth0Username(username)
  const { data } = await axios
    .post(
      'https://bemuse.au.auth0.com/oauth/token',
      new URLSearchParams({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: auth0Username,
        password,
        client_id: 'XOS0iHs3cwHICkVHwPEJYVHuyyLrETN4',
        scope: 'openid',
      }).toString(),
    )
    .catch((e) => {
      if (!isAxiosError(e, 403)) {
        throw e
      }
      throw new createHttpError.Unauthorized('Invalid credentials')
    })
    .catch(handleAxiosError('Unable to authenticate player'))

  // Since the ID token is directly returned by Auth0 (as supposed to being
  // sent to the client and then sent back to the server), we can trust it.
  // As an optimization, we can skip verifying the signature and just decode
  // the payload.
  const payload = decodeJwt(data.id_token)

  // Look up a player corresponding to the Auth0 user.
  const player = await PlayerCollection.findOne({
    linkedTo: payload.sub,
  })
  if (!player) {
    throw new createHttpError.Unauthorized(
      `Your account has been deactivated due to inactivity.`,
    )
  }
  return player
}

async function resolveAuth0Username(username: string) {
  // If the username is an email address, then it is already usable.
  if (username.includes('@')) {
    return username
  }

  // Otherwise, we store player ID (which is a UUID) in the username field.
  const player = await PlayerCollection.findOne({
    playerName: username,
  })
  if (!player) {
    throw new createHttpError.Unauthorized(`Player "${username}" is not found`)
  }

  logger.info('Resolved player "%s" => "%s"', username, player._id)
  return player._id
}
