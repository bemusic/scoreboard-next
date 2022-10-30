import { test, expect, APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { env } from './lib/env'

test('load data', async ({ request }) => {
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
