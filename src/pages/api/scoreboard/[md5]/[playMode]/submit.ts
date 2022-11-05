import { resolvePlayerId } from '@/app/player-token'
import { ScoreData, updateRankingEntryData } from '@/app/scoreboard'
import { RankingEntryCollection } from '@/db'
import { createEndpoint } from '@/packlets/next-endpoint'
import { z } from 'zod'

export default createEndpoint({
  input: z.object({
    scoreData: ScoreData,
  }),
}).handler(async ({ input, req }) => {
  const playerId = await resolvePlayerId(req)
  const md5 = String(req.query.md5)
  const playMode = String(req.query.playMode)
  const existingEntry = await RankingEntryCollection.findOne({
    md5,
    playMode,
    playerId,
  })
  const nextData = updateRankingEntryData(existingEntry?.data, input.scoreData)
  const savedEntry = await RankingEntryCollection.findOneAndUpdate(
    { md5, playMode, playerId },
    { $set: { data: nextData, updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' },
  )
  return { data: { id: savedEntry.value?._id } }
})
