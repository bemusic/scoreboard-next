import { env } from './env'

export class TestUser {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}

  static testUser() {
    return new TestUser('test!1', env('TEST_USER_PASSWORD'))
  }
}
