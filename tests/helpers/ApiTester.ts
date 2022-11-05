import { APIRequestContext, expect } from '@playwright/test'
import { env } from './env'

/**
 * This class is used to test API endpoints.
 * It takes care of logging in and maintaining the player token.
 */
export class ApiTester {
  private playerToken?: string

  constructor(private request: APIRequestContext) {}

  async login() {
    const username = 'test!1'
    const password = env('TEST_USER_PASSWORD')
    const response = await this.request.post('/api/auth/login', {
      data: { username, password },
    })
    const result = await response.json()
    this.playerToken = result.playerToken
    expect(this.playerToken).toBeTruthy()
  }

  async get(path: string) {
    const headers = this.playerToken
      ? { Authorization: `Bearer ${this.playerToken}` }
      : undefined
    return this.request.get(path, { headers })
  }

  async post(path: string, data: any) {
    const headers = this.playerToken
      ? { Authorization: `Bearer ${this.playerToken}` }
      : undefined
    return this.request.post(path, { headers, data })
  }

  async submitScore() {
    const response = await this.post(
      '/api/scoreboard/5ff51316cc7a63504fdd74a2e8007538/TS/submit',
      { score: 123456, total: 1000, count: [5, 4, 3, 2, 1], combo: 5, log: '' },
    )
    expect(response.status()).toBe(200)
    return response.json()
  }
}
