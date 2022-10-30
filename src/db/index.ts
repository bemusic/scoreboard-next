import { db } from './db'

export const PlayerCollection = db.collection<PlayerDoc>('Player')
export interface PlayerDoc {
  _id: string
  playerName: string
  linkedTo?: string
}

export const RankingEntryCollection =
  db.collection<RankingEntryDoc>('RankingEntry')
export interface RankingEntryDoc {
  _id: string
  data: RankingEntryData
  md5: string
  playMode: string
  playerId: string
  updatedAt: Date
}

export interface RankingEntryData {
  combo: number
  count: number[]
  playCount: number
  playNumber: number
  recordedAt: Date
  score: number
  total: number
}
