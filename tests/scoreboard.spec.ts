import { test, expect, APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ApiTester } from './lib/ApiTester'
import { env } from './lib/env'

test('load leaderboard', async ({ request }) => {
  const response = await request.get(
    '/api/scoreboard/5ff51316cc7a63504fdd74a2e8007538/BM/leaderboard',
  )
  expect(response.status()).toBe(200)
  const { data } = await response.json()
  expect(data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        rank: 1,
        entry: expect.objectContaining({
          player: expect.objectContaining({
            name: expect.any(String),
          }),
        }),
      }),
    ]),
  )
})

test('my record without score', async ({ request }) => {
  const tester = new ApiTester(request)
  await tester.login()

  const response = await tester.get(
    '/api/scoreboard/5ff51316cc7a63504fdd74a2e8007538/TS/mine',
  )
  expect(response.status()).toBe(200)
  const { data } = await response.json()
  expect(data).toBe(null)
})

test('my record with score', async ({ request }) => {
  const tester = new ApiTester(request)
  await tester.login()
  await tester.submitScore()

  const response = await tester.get(
    '/api/scoreboard/5ff51316cc7a63504fdd74a2e8007538/TS/mine',
  )
  expect(response.status()).toBe(200)
  const { data } = await response.json()
  expect(data).toBe(null)
})
