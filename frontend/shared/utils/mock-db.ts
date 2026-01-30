import fs from 'node:fs/promises'
import path from 'node:path'
import type { Booking } from '@/domains/booking'
import type { Listing, ListingImage } from '@/domains/listing'
import type { User } from '@/domains/user'
import { MOCK_LISTINGS } from '@/domains/listing/mock-listings'

export type DbListing = Listing & {
  description: string
  amenities: string[]
  photos: ListingImage[]
}

export type MockDb = {
  version: 1
  users: User[]
  listings: DbListing[]
  bookings: Booking[]
}

function dbFilePath() {
  const filename = process.env.LOCUS_MOCK_DB_FILE || '.locus-mock-db.json'
  return path.join(process.cwd(), filename)
}

function seedDb(): MockDb {
  const now = new Date().toISOString()
  const users: User[] = [
    { id: 'host_1', supabaseId: 'host_1', email: 'host1@locus.local', role: 'host', roles: ['host'] },
    { id: 'host_2', supabaseId: 'host_2', email: 'host2@locus.local', role: 'host', roles: ['host'] },
    { id: 'guest_1', supabaseId: 'guest_1', email: 'guest@locus.local', role: 'guest', roles: ['guest'] },
    { id: 'admin_1', supabaseId: 'admin_1', email: 'admin@locus.local', role: 'admin', roles: ['admin'] },
  ]

  const listings: DbListing[] = MOCK_LISTINGS.map((l) => ({
    ...l,
    description:
      'A bright, clean place with fast Wi‑Fi and self check-in. This is mock content used for the MVP scaffold.',
    amenities: ['Wi‑Fi', 'Kitchen', 'Washer', 'Air conditioning'],
    photos: l.images,
  }))

  const bookings: Booking[] = [
    {
      id: 'bkg_1',
      listingId: 'lst_1',
      userId: 'guest_1',
      from: '2026-02-10',
      to: '2026-02-12',
      guests: 2,
      totalPrice: 178,
      currency: 'USD',
      status: 'CONFIRMED',
      createdAt: now,
    },
  ]

  return { version: 1, users, listings, bookings }
}

const EMPTY_DB: MockDb = { version: 1, users: [], listings: [], bookings: [] }

export async function loadDb(): Promise<MockDb> {
  if (process.env.NODE_ENV === 'production') {
    return EMPTY_DB
  }
  const file = dbFilePath()
  try {
    const raw = await fs.readFile(file, 'utf8')
    return JSON.parse(raw) as MockDb
  } catch {
    const db = seedDb()
    await saveDb(db)
    return db
  }
}

export async function saveDb(db: MockDb) {
  if (process.env.NODE_ENV === 'production') return
  const file = dbFilePath()
  await fs.writeFile(file, JSON.stringify(db, null, 2), 'utf8')
}

