import { test, expect, APIRequestContext } from '@playwright/test'
import { decodeJwt } from 'jose'

test('login as test user', async ({ request }) => {
  test.skip(!process.env.TEST_USER_PASSWORD, 'TEST_USER_PASSWORD is not set')
  const payload = await login(
    request,
    'test!1',
    process.env.TEST_USER_PASSWORD!,
  )
  expect(payload).toEqual(
    expect.objectContaining({
      sub: expect.any(String),
      playerName: 'test!1',
    }),
  )
})

test('login as auth0 user', async ({ request }) => {
  test.skip(
    !process.env.AUTH0_TEST_USER_USERNAME,
    'AUTH0_TEST_USER_USERNAME is not set',
  )
  test.skip(
    !process.env.AUTH0_TEST_USER_PASSWORD,
    'AUTH0_TEST_USER_PASSWORD is not set',
  )
  const payload = await login(
    request,
    process.env.AUTH0_TEST_USER_USERNAME!,
    process.env.AUTH0_TEST_USER_PASSWORD!,
  )
  expect(payload).toEqual(
    expect.objectContaining({
      sub: expect.any(String),
      playerName: process.env.AUTH0_TEST_USER_USERNAME!,
    }),
  )
})

test('login as auth0 user with email', async ({ request }) => {
  test.skip(
    !process.env.AUTH0_TEST_USER_EMAIL,
    'AUTH0_TEST_USER_EMAIL is not set',
  )
  test.skip(
    !process.env.AUTH0_TEST_USER_PASSWORD,
    'AUTH0_TEST_USER_PASSWORD is not set',
  )
  const payload = await login(
    request,
    process.env.AUTH0_TEST_USER_EMAIL!,
    process.env.AUTH0_TEST_USER_PASSWORD!,
  )
  expect(payload).toEqual(
    expect.objectContaining({
      sub: expect.any(String),
      playerName: process.env.AUTH0_TEST_USER_USERNAME!,
    }),
  )
})

async function login(
  request: APIRequestContext,
  username: string,
  password: string,
) {
  await request.post('/api/dev/seed', { data: {} })
  const response = await request.post('/api/auth/login', {
    data: { username, password },
  })
  const result = await response.json()
  expect(result).toEqual(
    expect.objectContaining({
      playerToken: expect.any(String),
    }),
  )
  const payload = decodeJwt(result.playerToken)
  return payload
}
