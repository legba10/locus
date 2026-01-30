'use client'

import { useState, useRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface ImageUploadProps {
  listingId: string
  onUploadSuccess?: (url: string, path: string) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  className?: string
  disabled?: boolean
}

/**
 * Компонент для загрузки изображений в Supabase Storage
 */
export function ImageUpload({
  listingId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (files.length > maxFiles) {
      onUploadError?.(`Максимум ${maxFiles} файлов`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('listingId', listingId)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Ошибка загрузки')
        }

        setUploadProgress(((index + 1) / files.length) * 100)
        return { url: data.url, path: data.path }
      })

      const results = await Promise.all(uploadPromises)

      // Вызываем callback для каждого успешно загруженного файла
      results.forEach(({ url, path }) => {
        onUploadSuccess?.(url, path)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки'
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
        id={`image-upload-${listingId}`}
      />
      <label
        htmlFor={`image-upload-${listingId}`}
        className={cn(
          'inline-flex items-center justify-center',
          'px-6 py-3 rounded-[14px]',
          'bg-violet-600 text-white font-semibold text-[14px]',
          'hover:bg-violet-500 transition-colors',
          'cursor-pointer',
          'shadow-[0_4px_14px_rgba(124,58,237,0.35)]',
          (disabled || uploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {uploading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Загрузка... {uploadProgress > 0 && `${Math.round(uploadProgress)}%`}
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Загрузить фото
          </>
        )}
      </label>
    </div>
  )
}
