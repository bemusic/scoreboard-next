import { z } from 'zod'
import { createEndpoint } from '@/packlets/next-endpoint'
import axios from 'axios'
import { prisma } from '@/packlets/prisma-client'
import createHttpError from 'http-errors'

export default createEndpoint({
  input: z.object({
    username: z.string(),
    password: z.string(),
  }),
}).handler(async ({ input }) => {
  const { username, password } = input
  const auth0Username = await resolveAuth0Username(username)
  const { data } = await axios.post(
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
  return { message: `Hello ${input.username}!` }
})

async function resolveAuth0Username(username: string) {
  // If the username is an email address, then it is already usable.
  if (username.includes('@')) {
    return username
  }

  // Otherwise, we store player ID (which is a UUID) in the username field.
  const entry = await prisma.player.findUnique({
    where: {
      playerName: username,
    },
  })
  if (!entry) {
    throw new createHttpError.Unauthorized(`Player ${username} is not found`)
  }
  return entry.id
}
