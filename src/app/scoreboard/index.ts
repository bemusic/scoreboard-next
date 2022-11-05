import {
  PlayerCollection,
  PlayerDoc,
  RankingEntryCollection,
  RankingEntryData,
  RankingEntryDoc,
} from '@/db'
import { uniq } from 'lodash-es'
import { z } from 'zod'

/**
 * Get a leaderboard for a chart.
 * @param md5 Chart MD5 hash.
 * @param playMode Play mode, either 'BM' for BMS or 'KB' for keyboard.
 * @param max Maximum number of entries to return.
 */
export async function getLeaderboard(md5: string, playMode: string, max = 50) {
  max = Math.max(1, Math.min(50, max || 50))

  const entries = await RankingEntryCollection.find({ md5, playMode })
    .sort([['data.score', -1]])
    .limit(max)
    .toArray()
  const playerIds = uniq(entries.map((entry) => entry.playerId))
  const players = await PlayerCollection.find({
    _id: { $in: playerIds },
  }).toArray()
  const playerMap = new Map(players.map((player) => [player._id, player]))

  return {
    data: entries.flatMap((entry, index) => {
      const player = playerMap.get(entry.playerId)
      if (!player) return []
      return [
        {
          rank: index + 1,
          entry: serializeRankingEntry(entry, player),
        },
      ]
    }),
  }
}

/**
 * Return my own record for a chart.
 * @param md5 Chart MD5 hash.
 * @param playMode Play mode, either 'BM' for BMS or 'KB' for keyboard.
 * @param playerId Player ID.
 */
export async function getMyRecord(
  md5: string,
  playMode: string,
  playerId: string,
) {
  const existingEntry = await RankingEntryCollection.findOne({
    md5,
    playMode,
    playerId,
  })
  if (!existingEntry) {
    return { data: null }
  }
  const player = await PlayerCollection.findOne({ _id: playerId })
  if (!player) {
    throw new Error('Player not found: ' + playerId)
  }
  const rank = await RankingEntryCollection.countDocuments({
    md5: String(md5),
    playMode: String(playMode),
    'data.score': { $gt: existingEntry.data.score },
  }).then((count) => count + 1)
  return {
    data: {
      rank: rank,
      entry: serializeRankingEntry(existingEntry, player),
    },
  }
}

function serializeRankingEntry(entry: RankingEntryDoc, player: PlayerDoc) {
  return {
    id: String(entry._id),
    score: entry.data.score,
    combo: entry.data.combo,
    count: entry.data.count,
    total: entry.data.total,
    recordedAt: entry.data.recordedAt.toJSON(),
    playNumber: entry.data.playNumber,
    playCount: entry.data.playCount,
    player: serializePlayer(player),
  }
}

function serializePlayer(player: PlayerDoc) {
  return {
    id: player._id,
    name: player.playerName,
  }
}

export const ScoreData = z.object({
  score: z.number().int().min(0).max(555555),
  combo: z.number().int().min(0),
  count: z.tuple([
    z.number().int().min(0),
    z.number().int().min(0),
    z.number().int().min(0),
    z.number().int().min(0),
    z.number().int().min(0),
  ]),
  total: z.number().int().min(0),
  log: z.string(),
})

export type ScoreData = z.infer<typeof ScoreData>

export function updateRankingEntryData(
  original: RankingEntryData | null | undefined,
  data: ScoreData,
) {
  const nextPlayCount = (original?.playCount || 0) + 1
  const score = +data.score
  if (!original || score > original.score) {
    return Object.assign({}, original || {}, {
      score: score,
      playCount: nextPlayCount,
      playNumber: nextPlayCount,
      combo: +data.combo || 0,
      count: [
        +data.count[0] || 0,
        +data.count[1] || 0,
        +data.count[2] || 0,
        +data.count[3] || 0,
        +data.count[4] || 0,
      ],
      total: +data.total || 0,
      recordedAt: new Date(),
    })
  } else {
    return Object.assign({}, original, {
      playCount: nextPlayCount,
    })
  }
}
