import { config } from '@/config'
import { MongoClient } from 'mongodb'

const anyGlobal = global as any
export const client: MongoClient = (anyGlobal.__mongo ??= new MongoClient(
  config.MONGO_URL,
))
export const db = client.db()
