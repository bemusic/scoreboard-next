import { test, expect } from '@playwright/test'

test('login as test user', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: {
      username: 'test!1',
      password: 't',
    },
  })
  const result = await response.json()
  expect(result).toEqual(
    expect.objectContaining({
      auth_token: expect.any(String),
    }),
  )
})
