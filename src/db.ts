import { openDB, type IDBPDatabase } from 'idb'

export interface SpinRecord {
  id: string
  eventId: string
  prizeId: string
  prizeLabel: string
  deviceId: string
  createdAt: string
  synced: number
}

const DB_NAME = 'wheel'
const DB_VERSION = 2
const STORE = 'wheel_spins'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' })
          store.createIndex('synced', 'synced')
        }
        // v2: participant fields removed — no schema change needed for IDB
        // Old records with extra fields still work fine
      },
    })
  }
  return dbPromise
}

export async function saveSpin(record: SpinRecord): Promise<void> {
  const db = await getDb()
  await db.put(STORE, record)
}

export async function getUnsynced(): Promise<SpinRecord[]> {
  const db = await getDb()
  return db.getAllFromIndex(STORE, 'synced', 0)
}

export async function markSynced(id: string): Promise<void> {
  const db = await getDb()
  const record = await db.get(STORE, id)
  if (record) {
    record.synced = 1
    await db.put(STORE, record)
  }
}
