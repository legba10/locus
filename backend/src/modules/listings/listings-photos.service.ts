import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { supabase, LISTINGS_BUCKET, getSupabaseImageUrl } from '../../shared/lib/supabase'
import * as crypto from 'crypto'

// Тип для файла из multer
interface MulterFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

@Injectable()
export class ListingsPhotosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Загружает файл в Supabase Storage и сохраняет URL в БД
   */
  async uploadPhoto(listingId: string, userId: string, file: MulterFile, sortOrder: number = 0) {
    // Проверяем, что объявление существует и принадлежит пользователю
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { ownerId: true },
    })

    if (!listing) {
      throw new NotFoundException('Объявление не найдено')
    }

    if (listing.ownerId !== userId) {
      throw new ForbiddenException('Нет доступа к этому объявлению')
    }

    if (!supabase) {
      throw new Error('Supabase не настроен. Проверьте переменные окружения.')
    }

    // Валидация типа файла
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Неподдерживаемый тип файла. Разрешены: JPEG, PNG, WebP')
    }

    // Валидация размера (максимум 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('Размер файла превышает 10MB')
    }

    // Генерация уникального имени файла
    const fileExt = file.originalname.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExt}`
    const filePath = `listings/${listingId}/${fileName}`

    // Загрузка в Supabase Storage
    const { data, error } = await supabase.storage
      .from(LISTINGS_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      throw new Error(`Ошибка загрузки: ${error.message}`)
    }

    // Получение public URL
    const publicUrl = getSupabaseImageUrl(filePath)
    if (!publicUrl) {
      throw new Error('Не удалось получить URL изображения')
    }

    // Сохранение в базу данных
    const photo = await this.prisma.listingPhoto.create({
      data: {
        listingId,
        url: publicUrl,
        sortOrder,
      },
    })

    return photo
  }

  /**
   * Удаляет фотографию из Supabase Storage и БД
   */
  async deletePhoto(photoId: string, userId: string) {
    // Получаем фотографию с информацией об объявлении
    const photo = await this.prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: {
        listing: {
          select: { ownerId: true },
        },
      },
    })

    if (!photo) {
      throw new NotFoundException('Фотография не найдена')
    }

    if (photo.listing.ownerId !== userId) {
      throw new ForbiddenException('Нет доступа к этой фотографии')
    }

    // Извлекаем путь из URL
    const url = new URL(photo.url)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
    const filePath = pathMatch ? pathMatch[1] : null

    // Удаляем из Supabase Storage
    if (filePath && supabase) {
      const { error } = await supabase.storage
        .from(LISTINGS_BUCKET)
        .remove([filePath])

      if (error) {
        console.warn('Failed to delete from Supabase Storage:', error)
        // Продолжаем удаление из БД даже если не удалось удалить из Storage
      }
    }

    // Удаляем из базы данных
    await this.prisma.listingPhoto.delete({
      where: { id: photoId },
    })

    return { success: true }
  }

  /**
   * Получает все фотографии объявления
   */
  async getPhotos(listingId: string) {
    return this.prisma.listingPhoto.findMany({
      where: { listingId },
      orderBy: { sortOrder: 'asc' },
    })
  }

  /**
   * Обновляет порядок сортировки фотографий
   */
  async updatePhotoOrder(photoId: string, userId: string, sortOrder: number) {
    const photo = await this.prisma.listingPhoto.findUnique({
      where: { id: photoId },
      include: {
        listing: {
          select: { ownerId: true },
        },
      },
    })

    if (!photo) {
      throw new NotFoundException('Фотография не найдена')
    }

    if (photo.listing.ownerId !== userId) {
      throw new ForbiddenException('Нет доступа к этой фотографии')
    }

    return this.prisma.listingPhoto.update({
      where: { id: photoId },
      data: { sortOrder },
    })
  }
}
