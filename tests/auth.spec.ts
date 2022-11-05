import { test, expect, APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { env } from './helpers'

test('login as test user', async ({ request }) => {
  const TEST_USER_PASSWORD = env('TEST_USER_PASSWORD')
  const result = await loginSuccessfully(request, 'test!1', TEST_USER_PASSWORD)
  expect(result.playerName).toBe('test!1')
})

test('login as test user with wrong password', async ({ request }) => {
  const response = await login(request, 'test!1', randomUUID())
  expect(response.status()).toBe(401)
})

test('login as auth0 user', async ({ request }) => {
  const AUTH0_TEST_USER_USERNAME = env('AUTH0_TEST_USER_USERNAME')
  const AUTH0_TEST_USER_PASSWORD = env('AUTH0_TEST_USER_PASSWORD')
  const result = await loginSuccessfully(
    request,
    AUTH0_TEST_USER_USERNAME,
    AUTH0_TEST_USER_PASSWORD,
  )
  expect(result.playerName).toBe(AUTH0_TEST_USER_USERNAME)
})

test('login as auth0 user with wrong password', async ({ request }) => {
  const AUTH0_TEST_USER_USERNAME = env('AUTH0_TEST_USER_USERNAME')
  const response = await login(request, AUTH0_TEST_USER_USERNAME, randomUUID())
  expect(response.status()).toBe(401)
})

test('login as auth0 user with email', async ({ request }) => {
  const AUTH0_TEST_USER_EMAIL = env('AUTH0_TEST_USER_EMAIL')
  const AUTH0_TEST_USER_USERNAME = env('AUTH0_TEST_USER_USERNAME')
  const AUTH0_TEST_USER_PASSWORD = env('AUTH0_TEST_USER_PASSWORD')
  const result = await loginSuccessfully(
    request,
    AUTH0_TEST_USER_EMAIL,
    AUTH0_TEST_USER_PASSWORD,
  )
  expect(result.playerName).toBe(AUTH0_TEST_USER_USERNAME)
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
