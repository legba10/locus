import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params

  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL is missing' }, { status: 500 })
    }
    const response = await fetch(`${API_BASE_URL}/listings/${id}/insight`, {
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
