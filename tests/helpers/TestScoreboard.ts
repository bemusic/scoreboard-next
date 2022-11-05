import { expect } from '@playwright/test'
import { createHash, randomUUID } from 'crypto'
import { ApiTester } from './ApiTester'

export class TestScoreboard {
  constructor(public readonly md5: string, public readonly playMode: string) {}

  static random(): TestScoreboard {
    const md5 = createHash('md5').update(randomUUID()).digest('hex')
    return new TestScoreboard(md5, 'TS')
  }

  async getLeaderboard(tester: ApiTester) {
    const response = await tester.get(
      `/api/scoreboard/${this.md5}/${this.playMode}/leaderboard`,
    )
    expect(response.status()).toBe(200)
    return response.json()
  }

  async getMyRecord(tester: ApiTester) {
    const response = await tester.get(
      `/api/scoreboard/${this.md5}/${this.playMode}/mine`,
    )
    expect(response.status()).toBe(200)
    return response.json()
  }

  async submitScore(tester: ApiTester, score: number) {
    const data = {
      score: 123456,
      total: 1000,
      count: [5, 4, 3, 2, 1],
      combo: 5,
      log: '',
    }
  }
}
