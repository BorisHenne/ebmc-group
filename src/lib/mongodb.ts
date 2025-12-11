import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebmc'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) return db

  try {
    if (!client) {
      console.log('[MongoDB] Connecting to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
      client = new MongoClient(uri, {
        // Add timeouts to prevent hanging connections
        serverSelectionTimeoutMS: 10000, // 10 seconds to find a server
        connectTimeoutMS: 10000, // 10 seconds to establish connection
        socketTimeoutMS: 30000, // 30 seconds for socket operations
      })
      await client.connect()
      console.log('[MongoDB] Connected successfully')
    }

    db = client.db('ebmc')
    return db
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error)
    // Reset client on connection failure
    client = null
    db = null
    throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getCollection(name: string) {
  const database = await connectToDatabase()
  return database.collection(name)
}
