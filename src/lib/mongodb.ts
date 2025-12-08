import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebmc'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) return db

  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  db = client.db('ebmc')
  return db
}

export async function getCollection(name: string) {
  const database = await connectToDatabase()
  return database.collection(name)
}
