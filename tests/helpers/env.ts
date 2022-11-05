import { test } from '@playwright/test'

export function env(name: string) {
  test.skip(!process.env[name], `${name} is not set`)
  return process.env[name]!
}
