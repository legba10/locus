import { NextRequest, NextResponse } from 'next/server'
import { supabase, LISTINGS_BUCKET } from '@/shared/supabaseClient'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/upload/image
 * 
 * Загружает изображение в Supabase Storage bucket 'locus-listings'
 * 
 * Body (FormData):
 * - file: File - файл изображения
 * - listingId: string - ID объявления
 * 
 * Returns:
 * - { success: true, url: string } - успешная загрузка
 * - { success: false, error: string } - ошибка
 */
export async function POST(request: NextRequest) {
  try {
    // Проверка наличия Supabase клиента
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase не настроен. Проверьте переменные окружения.' },
        { status: 500 }
      )
    }

    // Получение FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const listingId = formData.get('listingId') as string | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Файл не предоставлен' },
        { status: 400 }
      )
    }

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'ID объявления не предоставлен' },
        { status: 400 }
      )
    }

    // Валидация типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Валидация размера файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Размер файла превышает 10MB' },
        { status: 400 }
      )
    }

    // Генерация уникального имени файла
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `listings/${listingId}/${fileName}`

    // Конвертация File в ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Загрузка в Supabase Storage
    const { data, error } = await supabase.storage
      .from(LISTINGS_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // Не перезаписывать существующие файлы
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { success: false, error: `Ошибка загрузки: ${error.message}` },
        { status: 500 }
      )
    }

    // Получение public URL
    const { data: urlData } = supabase.storage
      .from(LISTINGS_BUCKET)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { success: false, error: 'Не удалось получить URL изображения' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload/image
 * 
 * Удаляет изображение из Supabase Storage
 * 
 * Body (JSON):
 * - path: string - путь к файлу в Storage
 * 
 * Returns:
 * - { success: true } - успешное удаление
 * - { success: false, error: string } - ошибка
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase не настроен' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { path } = body

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Путь к файлу не предоставлен' },
        { status: 400 }
      )
    }

    const { error } = await supabase.storage
      .from(LISTINGS_BUCKET)
      .remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { success: false, error: `Ошибка удаления: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
