import { z } from 'zod'
import axios from 'axios'
import createHttpError from 'http-errors'
import { randomUUID } from 'crypto'
import { decodeJwt } from 'jose'
import { FirebasePlayerLinkCollection, PlayerCollection, PlayerDoc } from '@/db'
import { handleAxiosError, isAxiosError } from '@/packlets/handle-axios-error'
import { createLogger } from '@/packlets/logger'
import { firebaseAdmin } from './firebase-admin'

const logger = createLogger('auth')

export const Username = z.string().min(1).max(32).regex(/^\S+$/)
export const Email = z.string().email()
export const UsernameOrEmail = z.union([Username, Email])
export const Password = z.string().min(6)

const apiKey = global.process.env.FIREBASE_API_KEY

export async function authenticatePlayer(username: string, password: string) {
  // For test accounts, use a hardcoded password.
  if (username.startsWith('test!')) {
    return await getOrCreateTestUser(username, password)
  }

  // Resolve username to an email address.
  const email = await resolveEmailAddress(username)

  // Attempt to sign in with Firebase.
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
  const { data } = await axios
    .post(signInUrl, {
      email,
      password,
      returnSecureToken: true,
    })
    .catch((e) => {
      if (!isAxiosError(e, 400)) {
        throw e
      }
      const data = e.response?.data as any
      if (
        data?.error?.message !== 'EMAIL_NOT_FOUND' &&
        data?.error?.message !== 'INVALID_PASSWORD'
      ) {
        throw e
      }
      throw new createHttpError.Unauthorized('Invalid credentials')
    })
    .catch(handleAxiosError('Unable to authenticate player'))

  // Get the UID.
  const uid = data.localId

  // Look up a player corresponding to the Firebase user.
  const link = await FirebasePlayerLinkCollection.findOne({ firebaseUid: uid })
  if (!link) {
    throw new createHttpError.Unauthorized(
      'No player is linked to this account',
    )
  }

  // Find the player.
  const player = await PlayerCollection.findOne({ _id: link._id })
  if (!player) {
    throw new createHttpError.Unauthorized(`Linked player not found.`)
  }
  return player
}

async function getOrCreateTestUser(username: string, password: string) {
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

function isValidEmail(s: string) {
  return Email.safeParse(s).success
}

export async function signUpPlayer(
  username: string,
  password: string,
  email: string,
) {
  // If a test account is being created, we can skip and just return a player.
  if (username.startsWith('test!')) {
    return await getOrCreateTestUser(username, password)
  }
  throw new Error('UNIMPLEMENTED')

  // Ensure that the username is not taken.
  const existingPlayer = await PlayerCollection.findOne({
    playerName: username,
  })
  if (existingPlayer) {
    throw new createHttpError.Conflict('Username is already taken')
  }

  // Generate a random player ID (which is a UUID and will be used as the
  // username in Auth0).
  const playerId = randomUUID()

  // Sign up the player in Auth0.
  const { data } = await axios
    .post('https://bemuse.au.auth0.com/dbconnections/signup', {
      client_id: 'XOS0iHs3cwHICkVHwPEJYVHuyyLrETN4',
      email,
      password,
      username: playerId,
      connection: 'BemuseModern',
      user_metadata: { playerName: username },
    })
    .catch(handleAxiosError('Unable to create a player in Auth0'))

  // Create a player in the database.
  const player: PlayerDoc = {
    _id: playerId,
    playerName: username,
    linkedTo: data.user_id,
  }
  await PlayerCollection.insertOne(player)

  return player
}

async function resolveEmailAddress(username: string) {
  // If the username is an email address, then it is already usable.
  if (isValidEmail(username)) {
    return username
  }

  // Otherwise, we look up the player ID.
  const player = await PlayerCollection.findOne({ playerName: username })
  if (!player) {
    throw new createHttpError.Unauthorized(`Player "${username}" is not found`)
  }

  // Then find the associated Firebase user ID.
  const link = await FirebasePlayerLinkCollection.findOne({ _id: player._id })
  if (!link) {
    throw new createHttpError.Unauthorized(`Player "${username}" is unlinked`)
  }

  // Use the Admin SDK to look up the email address.
  const firebaseUser = await firebaseAdmin.auth().getUser(link.firebaseUid)
  if (!firebaseUser.email) {
    throw new createHttpError.Unauthorized(
      `Player "${username}" is not associated with an email address`,
    )
  }

  // Return the email address.
  logger.info(
    'Resolved player "%s" => "%s" => "%s"',
    username,
    firebaseUser.uid,
    firebaseUser.email,
  )
  return firebaseUser.email
}
