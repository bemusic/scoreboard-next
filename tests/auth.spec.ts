import { test, expect } from '@playwright/test'

test('login', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: {
      username: 'test',
      password: 'test',
    },
  })
  const result = await response.json()
  // expect(result).toEqual({ success: true })
})
