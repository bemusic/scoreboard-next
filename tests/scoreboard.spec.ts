import { test, expect, APIRequestContext } from '@playwright/test'
import { randomUUID } from 'crypto'
import { ApiTester, env } from './helpers'
import { TestScoreboard } from './helpers/TestScoreboard'

test('load leaderboard', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = new ApiTester(request)
  const { data } = await scoreboard.getLeaderboard(tester)
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
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  const { data } = await scoreboard.getMyRecord(tester)
  expect(data).toBe(null)
})

test('my record with score', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 123456)
  const { data } = await scoreboard.getMyRecord(tester)
  expect(data).toEqual(
    expect.objectContaining({
      rank: 1,
      entry: expect.objectContaining({
        player: expect.objectContaining({
          name: 'test!1',
        }),
      }),
    }),
  )
})

// test('updates ranking entry score if record is better')
// test('does not update ranking entry score if record is not better')
// test('updates play count even if record is not better')
// test('records the date and time of the score')
