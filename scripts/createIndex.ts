import 'dotenv/config'
import {
  closeDb,
  FirebasePlayerLinkCollection,
  PlayerCollection,
  RankingEntryCollection,
} from '@/db'

async function createIndices() {
  console.log(
    await PlayerCollection.createIndex({ playerName: 1 }, { unique: true }),
  )
  console.log(
    await RankingEntryCollection.createIndex(
      { md5: 1, playMode: 1, playerId: 1 },
      { unique: true },
    ),
  )
  console.log(
    await FirebasePlayerLinkCollection.createIndex(
      { firebaseUid: 1 },
      { unique: true },
    ),
  )
}

createIndices().finally(closeDb)
