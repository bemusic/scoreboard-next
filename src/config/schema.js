const { z } = require('zod')

exports.schema = z.object({
  MONGO_URL: z.string(),
  PLAYER_TOKEN_SECRET: z.string(),
  TEST_USER_PASSWORD: z.string(),
})
