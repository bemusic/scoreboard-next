import { Email, resetPassword } from '@/app/auth'
import { createEndpoint } from '@/packlets/next-endpoint'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    email: Email,
  }),
}).handler(async ({ input }) => {
  const { email } = input
  await resetPassword(email)
  return { ok: true }
})
