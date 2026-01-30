# Настройка Supabase Storage для LOCUS

## 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект или используйте существующий
3. Запишите URL проекта и Anon Key из настроек проекта

## 2. Настройка переменных окружения

Добавьте в файл `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Создание Bucket в Supabase Storage

1. В панели Supabase перейдите в **Storage**
2. Нажмите **New bucket**
3. Настройки:
   - **Name**: `locus-listings`
   - **Public bucket**: ✅ Включено (для публичного доступа к изображениям)
   - Нажмите **Create bucket**

## 4. Настройка политик доступа (Storage Policies)

### 4.1 Публичное чтение изображений

В Supabase перейдите в **Storage** → **Policies** для bucket `locus-listings`

Создайте новую политику:

**Policy name**: `Public read access`

**Allowed operation**: `SELECT`

**Target roles**: `anon`, `authenticated`

**Policy definition**:
```sql
bucket_id = 'locus-listings'
```

### 4.2 Загрузка изображений (только авторизованные)

Создайте новую политику:

**Policy name**: `Authenticated upload`

**Allowed operation**: `INSERT`

**Target roles**: `authenticated`

**Policy definition**:
```sql
bucket_id = 'locus-listings'
```

### 4.3 Обновление и удаление изображений

Создайте новую политику:

**Policy name**: `Authenticated update and delete`

**Allowed operations**: `UPDATE`, `DELETE`

**Target roles**: `authenticated`

**Policy definition**:
```sql
bucket_id = 'locus-listings'
```

## 5. Структура хранения файлов

Файлы сохраняются по пути:
```
listings/{listingId}/{fileName}
```

Пример:
```
listings/123e4567-e89b-12d3-a456-426614174000/1699123456789-abc123.jpg
```

## 6. Установка зависимостей

```bash
cd frontend
npm install @supabase/supabase-js
```

## 7. Использование

### 7.1 Загрузка изображения

```typescript
import { ImageUpload } from '@/shared/components/ImageUpload'

<ImageUpload
  listingId="listing-id"
  onUploadSuccess={(url, path) => {
    console.log('Uploaded:', url)
    // Сохранить URL в базу данных
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error)
  }}
/>
```

### 7.2 Получение URL изображения

```typescript
import { getSupabaseImageUrl } from '@/shared/supabaseClient'

const imageUrl = getSupabaseImageUrl('listings/123/photo.jpg')
```

### 7.3 Отображение изображения с fallback

```typescript
import { getImageUrl, getPlaceholderImage } from '@/shared/utils/imageUtils'

const imageUrl = getImageUrl(listing.photo, getPlaceholderImage(listing.id))
```

## 8. API Endpoints

### POST /api/upload/image
Загружает изображение в Supabase Storage

**Body (FormData)**:
- `file`: File
- `listingId`: string

**Response**:
```json
{
  "success": true,
  "url": "https://...supabase.co/storage/v1/object/public/locus-listings/...",
  "path": "listings/123/photo.jpg"
}
```

### DELETE /api/upload/image
Удаляет изображение из Supabase Storage

**Body (JSON)**:
```json
{
  "path": "listings/123/photo.jpg"
}
```

### POST /api/listings/[id]/images
Сохраняет URL изображения в базу данных

**Body (JSON)**:
```json
{
  "url": "https://...",
  "sortOrder": 0
}
```

## 9. Проверка работы

1. Убедитесь, что переменные окружения установлены
2. Проверьте, что bucket `locus-listings` создан и публичный
3. Проверьте политики доступа
4. Попробуйте загрузить изображение через компонент `ImageUpload`

## 10. Troubleshooting

### Ошибка: "Supabase не настроен"
- Проверьте переменные окружения в `.env.local`
- Убедитесь, что файл `.env.local` находится в папке `frontend/`

### Ошибка: "Bucket not found"
- Убедитесь, что bucket `locus-listings` создан
- Проверьте правильность названия bucket

### Ошибка: "Permission denied"
- Проверьте политики доступа в Supabase
- Убедитесь, что bucket публичный для чтения

### Изображения не отображаются
- Проверьте, что URL изображения валидный
- Убедитесь, что bucket публичный
- Проверьте CORS настройки в Supabase (если нужно)
