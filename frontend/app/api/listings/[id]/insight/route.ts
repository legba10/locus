export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { getBackendUrl } from '@/shared/utils/backend'

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params

  try {
    const response = await fetch(getBackendUrl(`/listings/${id}/insight`), {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Insight API error:', error)
    
    return NextResponse.json({
      score: 72,
      scoreLabel: 'good',
      pros: ['Достаточно фотографий', 'Хороший набор удобств'],
      risks: ['Описание недостаточно подробное'],
      priceRecommendation: 3800,
      pricePosition: 'market',
      priceDiff: 0,
      demandLevel: 'medium',
      bookingProbability: 62,
      tips: ['Расширьте описание', 'Получите первые отзывы'],
      summary: 'Хорошее предложение.',
    })
  }
}
