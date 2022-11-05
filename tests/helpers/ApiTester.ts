import { APIRequestContext, expect } from '@playwright/test'
import { env } from './env'
import { TestUser } from './TestUser'

/**
 * This class is used to test API endpoints.
 * It takes care of logging in and maintaining the player token.
 */
export class ApiTester {
  constructor(
    private request: APIRequestContext,
    private playerToken?: string,
  ) {}

  static async login(request: APIRequestContext, user = TestUser.testUser()) {
    const response = await request.post('/api/auth/login', {
      data: {
        username: user.username,
        password: user.password,
      },
    })
    const result = await response.json()
    const playerToken = result.playerToken
    expect(playerToken).toBeTruthy()
    return new ApiTester(request, playerToken)
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
}
