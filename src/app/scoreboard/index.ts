import {
  PlayerCollection,
  PlayerDoc,
  RankingEntryCollection,
  RankingEntryDoc,
} from '@/db'
import { uniq } from 'lodash-es'

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
