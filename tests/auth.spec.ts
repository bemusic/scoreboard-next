import { test, expect, APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { env, itMustSucceed } from './helpers'

test('login as test user', async ({ request }) => {
  const TEST_USER_PASSWORD = env('TEST_USER_PASSWORD')
  const result = await loginSuccessfully(request, 'test!1', TEST_USER_PASSWORD)
  expect(result.playerName).toBe('test!1')
})

test('login as test user with wrong password', async ({ request }) => {
  const response = await login(request, 'test!1', randomUUID())
  expect(response.status()).toBe(401)
})

test('login as existing user', async ({ request }) => {
  const FIREBASE_TEST_USER_USERNAME = env('FIREBASE_TEST_USER_USERNAME')
  const FIREBASE_TEST_USER_PASSWORD = env('FIREBASE_TEST_USER_PASSWORD')
  const result = await loginSuccessfully(
    request,
    FIREBASE_TEST_USER_USERNAME,
    FIREBASE_TEST_USER_PASSWORD,
  )
  expect(result.playerName).toBe(FIREBASE_TEST_USER_USERNAME)
})

test('login as existing user with wrong password', async ({ request }) => {
  const FIREBASE_TEST_USER_USERNAME = env('FIREBASE_TEST_USER_USERNAME')
  const response = await login(
    request,
    FIREBASE_TEST_USER_USERNAME,
    randomUUID(),
  )
  expect(response.status()).toBe(401)
})

test('login as existing user with email', async ({ request }) => {
  const FIREBASE_TEST_USER_EMAIL = env('FIREBASE_TEST_USER_EMAIL')
  const FIREBASE_TEST_USER_USERNAME = env('FIREBASE_TEST_USER_USERNAME')
  const FIREBASE_TEST_USER_PASSWORD = env('FIREBASE_TEST_USER_PASSWORD')
  const result = await loginSuccessfully(
    request,
    FIREBASE_TEST_USER_EMAIL,
    FIREBASE_TEST_USER_PASSWORD,
  )
  expect(result.playerName).toBe(FIREBASE_TEST_USER_USERNAME)
})

test('sign up', async ({ request }) => {
  const TEST_USER_PASSWORD = env('TEST_USER_PASSWORD')
  const result = await request
    .post('/api/auth/signup', {
      data: {
        username: 'test!1',
        password: TEST_USER_PASSWORD,
        email: 'test1@tester.bemuse.ninja',
      },
    })
    .then(itMustSucceed())
  expect(result.playerName).toBe('test!1')
  expect(result.playerToken).toEqual(expect.any(String))
})

test('reset password', async ({ request }) => {
  const response = await request.post('/api/auth/reset', {
    data: { email: 'tester@tester.bemuse.ninja' },
  })
  expect(response.status()).toBe(200)
})

test('renewing token', async ({ request }) => {
  const TEST_USER_PASSWORD = env('TEST_USER_PASSWORD')
  const result = await loginSuccessfully(request, 'test!1', TEST_USER_PASSWORD)
  const token1 = result.playerToken
  test.skip(true, 'TODO: implement')
  const response = await request.post('/api/auth/renew', {
    headers: { Authorization: `Bearer ${token1}` },
  })
  expect(response.status()).toBe(200)
  const result2 = await response.json()
  const token2 = result2.playerToken
  expect(token2).toBe(expect.any(String))
  expect(token1).not.toBe(token2)
})

async function loginSuccessfully(
  request: APIRequestContext,
  username: string,
  password: string,
) {
  const response = await login(request, username, password)
  const result = await response.json()
  expect(result).toEqual(
    expect.objectContaining({
      playerToken: expect.any(String),
      playerName: expect.any(String),
      playerId: expect.any(String),
    }),
  )
  return result
}

async function login(
  request: APIRequestContext,
  username: string,
  password: string,
) {
  await request.post('/api/dev/seed', { data: {} })
  const response = await request.post('/api/auth/login', {
    data: { username, password },
  })
  return response
}
