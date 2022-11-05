import { test, expect } from '@playwright/test'
import { ApiTester, itMustSucceed } from './helpers'
import { TestScoreboard } from './helpers/TestScoreboard'
import { TestUser } from './helpers/TestUser'

test('load leaderboard', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = new ApiTester(request)
  await scoreboard
    .submitScore(await ApiTester.login(request, TestUser.testUser(1)), 123456)
    .then(itMustSucceed())
  await scoreboard
    .submitScore(await ApiTester.login(request, TestUser.testUser(2)), 234567)
    .then(itMustSucceed())
  const { data } = await scoreboard.getLeaderboard(tester).then(itMustSucceed())
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

test('getting my own record requires a valid token', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = ApiTester.guest(request)
  const response = await scoreboard.getMyRecord(tester)
  expect(response.status()).toBe(401)
})

test('my record without score', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
  expect(data).toBe(null)
})

test('my record with score', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 123456).then(itMustSucceed())
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
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

test('updates ranking entry score if record is better', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 222222).then(itMustSucceed())
  await scoreboard.submitScore(tester, 333333).then(itMustSucceed())
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
  expect(data.entry.score).toBe(333333)
})

test('does not update ranking entry score if record is not better', async ({
  request,
}) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 222222).then(itMustSucceed())
  await scoreboard.submitScore(tester, 123456).then(itMustSucceed())
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
  expect(data.entry.score).toBe(222222)
})

test('updates play count even if record is not better', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 222222).then(itMustSucceed())
  await scoreboard.submitScore(tester, 123456).then(itMustSucceed())
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
  expect(data.entry.playCount).toBe(2)
})

test('records the date and time of the score', async ({ request }) => {
  const scoreboard = TestScoreboard.random()
  const tester = await ApiTester.login(request)
  await scoreboard.submitScore(tester, 131072).then(itMustSucceed())
  const { data } = await scoreboard.getMyRecord(tester).then(itMustSucceed())
  expect(data.entry.recordedAt).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/,
  )
})
