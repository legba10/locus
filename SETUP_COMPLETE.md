# Полная настройка LOCUS с Supabase Storage

## ✅ Выполненные задачи

### 1. Переменные окружения

#### Backend (.env)
Добавьте следующие переменные:
```env
DATABASE_URL=postgresql://... (уже настроено)
SUPABASE_URL=https://zfarzybrjdnelujpxdtl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<ваш-service-role-key>
```

**Важно:** `SUPABASE_SERVICE_ROLE_KEY` можно получить в Supabase Dashboard:
1. Перейдите в Project Settings → API
2. Найдите "service_role" key (секретный ключ, не публикуйте его)

#### Frontend (.env.local)
Уже настроено:
```env
NEXT_PUBLIC_SUPABASE_URL=https://zfarzybrjdnelujpxdtl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_BYub0ylZDb6RtuJDb3NzbA_QgEW68om
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

### 2. Установка зависимостей

#### Backend
```bash
cd backend
npm install @supabase/supabase-js
```

**Примечание:** NestJS уже имеет `@nestjs/platform-express`, который включает поддержку multer для загрузки файлов.

#### Frontend
```bash
cd frontend
npm install @supabase/supabase-js
```

### 3. Настройка Supabase Storage

1. **Создайте bucket в Supabase:**
   - Перейдите в Storage в панели Supabase
   - Создайте новый bucket с именем: `locus-listings`
   - Включите "Public bucket" (для публичного доступа к изображениям)

2. **Настройте политики доступа (RLS):**

   **Политика 1: Публичное чтение**
   - Operation: `SELECT`
   - Roles: `anon`, `authenticated`
   - Policy: `bucket_id = 'locus-listings'`

   **Политика 2: Загрузка (только авторизованные)**
   - Operation: `INSERT`
   - Roles: `authenticated`
   - Policy: `bucket_id = 'locus-listings'`

   **Политика 3: Обновление и удаление**
   - Operations: `UPDATE`, `DELETE`
   - Roles: `authenticated`
   - Policy: `bucket_id = 'locus-listings'`

### 4. Prisma

```bash
cd backend
npx prisma generate
npx prisma db push
```

Если возникают ошибки EPERM на Windows:
```bash
# Закройте все процессы, использующие Prisma
# Затем:
npm install
npx prisma generate --force
```

### 5. Структура файлов

Созданные файлы:

**Backend:**
- `backend/src/shared/lib/supabase.ts` - Supabase клиент для backend
- `backend/src/modules/listings/listings-photos.service.ts` - Сервис для работы с фотографиями
- `backend/src/modules/listings/dto/upload-photo.dto.ts` - DTO для загрузки

**Frontend:**
- `frontend/shared/supabaseClient.ts` - Supabase клиент для frontend
- `frontend/shared/utils/imageUtils.ts` - Утилиты для работы с изображениями
- `frontend/shared/components/ImageUpload.tsx` - Компонент загрузки
- `frontend/app/api/upload/image/route.ts` - API route для загрузки

### 6. API Endpoints

#### Backend (NestJS)

**GET /api/v1/listings/:id/photos**
Получить все фотографии объявления

**POST /api/v1/listings/:id/photos**
Загрузить фотографию
- Content-Type: `multipart/form-data`
- Body: `file` (File), `sortOrder` (number, optional)
- Auth: Required (JWT token)

**DELETE /api/v1/listings/:id/photos/:photoId**
Удалить фотографию
- Auth: Required

**PATCH /api/v1/listings/:id/photos/:photoId/order**
Обновить порядок сортировки
- Body: `{ sortOrder: number }`
- Auth: Required

#### Frontend (Next.js API Routes)

**POST /api/upload/image**
Загрузить изображение в Supabase Storage
- Body: FormData (`file`, `listingId`)

**DELETE /api/upload/image**
Удалить изображение из Supabase Storage
- Body: `{ path: string }`

**POST /api/listings/[id]/images**
Сохранить URL изображения в БД
- Body: `{ url: string, sortOrder?: number }`

### 7. Запуск проекта

#### Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend запустится на `http://localhost:4000`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на `http://localhost:3000`

### 8. Использование

#### Загрузка фотографии (Frontend)

```typescript
import { ImageUpload } from '@/shared/components/ImageUpload'

<ImageUpload
  listingId="listing-id"
  onUploadSuccess={(url, path) => {
    // Сохранить URL в БД через API
    fetch(`/api/listings/${listingId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, sortOrder: 0 }),
    })
  }}
/>
```

#### Отображение фотографий

Компоненты уже обновлены для использования `getImageUrl` с fallback на placeholder.

### 9. Проверка работы

1. **Проверьте Supabase Storage:**
   - Убедитесь, что bucket `locus-listings` создан и публичный
   - Проверьте политики доступа

2. **Проверьте переменные окружения:**
   - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Проверьте Prisma:**
   ```bash
   cd backend
   npx prisma studio
   ```
   Убедитесь, что таблица `ListingPhoto` существует

4. **Протестируйте загрузку:**
   - Создайте объявление
   - Загрузите фотографию через API или компонент
   - Проверьте, что фотография появилась в Supabase Storage
   - Проверьте, что URL сохранился в БД

### 10. Troubleshooting

**Ошибка: "Supabase не настроен"**
- Проверьте переменные окружения в `.env` (backend) и `.env.local` (frontend)
- Убедитесь, что файлы находятся в правильных директориях

**Ошибка: "Bucket not found"**
- Убедитесь, что bucket `locus-listings` создан в Supabase
- Проверьте правильность названия bucket

**Ошибка: "Permission denied"**
- Проверьте политики доступа в Supabase Storage
- Убедитесь, что bucket публичный для чтения

**Ошибка Prisma EPERM (Windows)**
- Закройте все процессы, использующие Prisma (Prisma Studio, IDE, терминалы)
- Запустите `npx prisma generate --force`
- Если не помогает, перезагрузите компьютер

**Изображения не отображаются**
- Проверьте, что URL изображения валидный
- Убедитесь, что bucket публичный
- Проверьте CORS настройки в Supabase (если нужно)

### 11. Следующие шаги

После успешной настройки:
1. Протестируйте загрузку фотографий через API
2. Интегрируйте компонент `ImageUpload` в форму создания объявления
3. Обновите страницу объявления для отображения галереи фотографий
4. Добавьте возможность удаления и переупорядочивания фотографий
