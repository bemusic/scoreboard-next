import { APIResponse, expect } from '@playwright/test'

export function itMustSucceed() {
  return async (response: APIResponse) => {
    expect(response.status()).toBe(200)
    const { data } = await response.json()
    expect(data).not.toBeNull()
  }
}
