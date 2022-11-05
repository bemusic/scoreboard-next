import { env } from './env'

export class TestUser {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}

  static testUser(number = 1) {
    return new TestUser('test!' + number, env('TEST_USER_PASSWORD'))
  }
}
