import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const cities = [
  { id: 'moscow', label: 'Moscow', country: 'RU' },
  { id: 'spb', label: 'Saint Petersburg', country: 'RU' },
  { id: 'kazan', label: 'Kazan', country: 'RU' },
  { id: 'sochi', label: 'Sochi', country: 'RU' },
  { id: 'dubai', label: 'Dubai', country: 'AE' },
  { id: 'berlin', label: 'Berlin', country: 'DE' },
]

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  const items = q ? cities.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 8) : cities
  return NextResponse.json({ items })
}

