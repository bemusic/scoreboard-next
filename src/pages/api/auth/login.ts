import { z } from 'zod'
import { createEndpoint } from '@/packlets/next-endpoint'

export default createEndpoint({
  input: z.object({
    username: z.string(),
    password: z.string(),
  })
}).handler(async ({ input }) => {
  return { message: `Hello ${input.username}!` }
})