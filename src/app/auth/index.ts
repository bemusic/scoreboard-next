import { z } from 'zod'
import axios from 'axios'
import createHttpError from 'http-errors'
import { randomUUID } from 'crypto'
import {
  FirebasePlayerLinkCollection,
  FirebasePlayerLinkDoc,
  PlayerCollection,
  PlayerDoc,
} from '@/db'
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
  const { email, link: resolvedLink } = await resolveEmailAddress(username)

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
      const message = (e.response?.data as any)?.error?.message
      if (message !== 'EMAIL_NOT_FOUND' && message !== 'INVALID_PASSWORD') {
        throw e
      }
      throw new createHttpError.Unauthorized(
        resolvedLink?.lastSignedInAt
          ? 'Invalid credentials'
          : 'As of December 2022, we had reset all passwords. To sign in, you must reset your password. To do that, leave the password field blank and click "Log In". If you forgot your username, you can also use your email address as username when logging in.',
      )
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

  // Save the last signed in time.
  await FirebasePlayerLinkCollection.updateOne(
    { _id: link._id },
    { $set: { lastSignedInAt: new Date().toISOString() } },
  )

  // Find the player.
  const player = await PlayerCollection.findOne({ _id: link._id })
  if (!player) {
    throw new createHttpError.Unauthorized(`Linked player not found.`)
  }
  return player
}

async function getOrCreateTestUser(username: string, password: string) {
  if (password !== process.env.TEST_USER_PASSWORD) {
    throw new createHttpError.Unauthorized('Invalid password for test account')
  }
  return await upsertPlayer(username)
}

async function upsertPlayer(playerName: string) {
  const result = await PlayerCollection.findOneAndUpdate(
    { playerName },
    { $setOnInsert: { _id: randomUUID(), playerName } },
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

  // Ensure that the username is not taken.
  const existingPlayer = await PlayerCollection.findOne({
    playerName: username,
  })
  if (existingPlayer) {
    // Check if the player is linked to a Firebase user.
    const link = await FirebasePlayerLinkCollection.findOne({
      _id: existingPlayer._id,
    })
    if (link) {
      throw new createHttpError.Conflict('Username is already taken')
    }
  }

  // Upsert a player
  const player = await upsertPlayer(username)

  // Create a Firebase user
  const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`
  const { data } = await axios
    .post(signUpUrl, {
      email,
      password,
      returnSecureToken: true,
    })
    .catch((e) => {
      if (!isAxiosError(e)) {
        throw e
      }
      const message = (e.response?.data as any)?.error?.message
      if (message !== 'EMAIL_EXISTS') {
        throw e
      }
      throw new createHttpError.Conflict('Email is already in use')
    })

  // Get the UID.
  const uid = data.localId

  // Link the Firebase user to the player.
  await FirebasePlayerLinkCollection.insertOne({
    _id: player._id,
    firebaseUid: uid,
  })

  return player
}

async function resolveEmailAddress(username: string): Promise<{
  link?: FirebasePlayerLinkDoc
  email: string
}> {
  // If the username is an email address, then it is already usable.
  if (isValidEmail(username)) {
    return { email: username }
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
  return { email: firebaseUser.email, link }
}

export async function resetPassword(email: string) {
  if (email.endsWith('@tester.bemuse.ninja')) {
    return true
  }

  const resetPasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`
  await axios
    .post(resetPasswordUrl, {
      requestType: 'PASSWORD_RESET',
      email,
    })
    .catch((e) => {
      if (!isAxiosError(e)) {
        throw e
      }
      const message = (e.response?.data as any)?.error?.message
      if (message !== 'EMAIL_NOT_FOUND') {
        throw e
      }
      throw new createHttpError.NotFound('Email is not registered')
    })
  return true
}

export async function getPlayerById(playerId: string) {
  const player = await PlayerCollection.findOne({ _id: playerId })
  return player
}
