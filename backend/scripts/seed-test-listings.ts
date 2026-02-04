/**
 * Seed Test Listings — 20 объявлений с реальными фото
 * 
 * Запуск: npx ts-node scripts/seed-test-listings.ts
 * 
 * Требования:
 * - Разные города (Москва, СПб, Сургут, Казань, Екатеринбург)
 * - Реальные фото с Unsplash
 * - Реалистичные цены
 * - Разные типы жилья
 */

import { ListingStatus, ListingType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Unsplash фото квартир и интерьеров (статичные URL)
const APARTMENT_PHOTOS = [
  // Современные квартиры
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&h=800&fit=crop",
  // Гостиные
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop",
  // Спальни
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=800&fit=crop",
  // Кухни
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b25ba?w=1200&h=800&fit=crop",
  // Студии
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop",
  // Комнаты
  "https://images.unsplash.com/photo-1598928506311-c55ez5a15d46?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&h=800&fit=crop",
  // Виды из окна
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=800&fit=crop",
  "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop",
];

// Данные для объявлений по городам
interface ListingData {
  city: string;
  title: string;
  description: string;
  type: ListingType;
  basePrice: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
}

const MOSCOW_LISTINGS: ListingData[] = [
  {
    city: "Москва",
    title: "Стильная студия в центре",
    description: "Уютная студия в самом сердце Москвы. Панорамные окна с видом на город. Рядом метро Арбатская. Полностью оборудована для комфортного проживания.",
    type: ListingType.STUDIO,
    basePrice: 65000,
    rooms: 1,
    area: 32,
    floor: 12,
    totalFloors: 25,
  },
  {
    city: "Москва",
    title: "Просторная квартира на Патриарших",
    description: "Двухкомнатная квартира в историческом районе. Высокие потолки, дизайнерский ремонт. Тихий двор, рядом парки и рестораны. Идеально для деловых поездок.",
    type: ListingType.APARTMENT,
    basePrice: 95000,
    rooms: 2,
    area: 58,
    floor: 4,
    totalFloors: 7,
  },
  {
    city: "Москва",
    title: "Современные апартаменты Сити",
    description: "Апартаменты премиум-класса в Москва-Сити. Вид на небоскрёбы, фитнес и бассейн в доме. 5 минут до метро Выставочная. Консьерж 24/7.",
    type: ListingType.APARTMENT,
    basePrice: 120000,
    rooms: 2,
    area: 72,
    floor: 35,
    totalFloors: 50,
  },
  {
    city: "Москва",
    title: "Уютная комната у метро",
    description: "Чистая комната в ухоженной квартире. Общая кухня и санузел. 3 минуты до метро Сокол. Тихие соседи. Подходит для студентов и молодых специалистов.",
    type: ListingType.ROOM,
    basePrice: 28000,
    rooms: 1,
    area: 18,
    floor: 5,
    totalFloors: 9,
  },
  {
    city: "Москва",
    title: "Квартира с видом на Кремль",
    description: "Эксклюзивная квартира с потрясающим видом на Кремль и Москву-реку. Историческое здание, современный ремонт. Идеально для туристов.",
    type: ListingType.APARTMENT,
    basePrice: 110000,
    rooms: 3,
    area: 80,
    floor: 6,
    totalFloors: 8,
  },
  {
    city: "Москва",
    title: "Светлая студия на Чистых прудах",
    description: "Компактная студия в тихом переулке. Свежий ремонт, вся техника. До метро 5 минут пешком. Рядом парк и кафе.",
    type: ListingType.STUDIO,
    basePrice: 55000,
    rooms: 1,
    area: 28,
    floor: 3,
    totalFloors: 5,
  },
];

const SPB_LISTINGS: ListingData[] = [
  {
    city: "Санкт-Петербург",
    title: "Квартира на Невском проспекте",
    description: "Классическая петербургская квартира в доходном доме. Высокие потолки с лепниной, камин. Рядом Эрмитаж и Дворцовая площадь.",
    type: ListingType.APARTMENT,
    basePrice: 75000,
    rooms: 2,
    area: 65,
    floor: 3,
    totalFloors: 5,
  },
  {
    city: "Санкт-Петербург",
    title: "Студия на Васильевском острове",
    description: "Современная студия с видом на Финский залив. Новый дом, подземная парковка. Рядом метро Приморская.",
    type: ListingType.STUDIO,
    basePrice: 45000,
    rooms: 1,
    area: 30,
    floor: 14,
    totalFloors: 25,
  },
  {
    city: "Санкт-Петербург",
    title: "Апартаменты у Мариинского театра",
    description: "Элегантные апартаменты в историческом центре. Окна во двор-колодец, типичный петербургский шарм. Идеально для любителей культуры.",
    type: ListingType.APARTMENT,
    basePrice: 68000,
    rooms: 2,
    area: 55,
    floor: 4,
    totalFloors: 6,
  },
  {
    city: "Санкт-Петербург",
    title: "Комната в коммуналке на Петроградке",
    description: "Атмосферная комната в исторической коммуналке. Высокие потолки, паркет. Общая кухня. Настоящий петербургский опыт.",
    type: ListingType.ROOM,
    basePrice: 22000,
    rooms: 1,
    area: 20,
    floor: 2,
    totalFloors: 4,
  },
  {
    city: "Санкт-Петербург",
    title: "Квартира с видом на каналы",
    description: "Романтичная квартира с видом на канал Грибоедова. Рядом Спас на Крови и Русский музей. Балкон с видом на воду.",
    type: ListingType.APARTMENT,
    basePrice: 85000,
    rooms: 2,
    area: 50,
    floor: 5,
    totalFloors: 6,
  },
];

const SURGUT_LISTINGS: ListingData[] = [
  {
    city: "Сургут",
    title: "Новая квартира в ЖК Северный",
    description: "Современная однокомнатная квартира в новом жилом комплексе. Тёплый пол, качественная отделка. Рядом школа и детский сад.",
    type: ListingType.APARTMENT,
    basePrice: 35000,
    rooms: 1,
    area: 42,
    floor: 8,
    totalFloors: 17,
  },
  {
    city: "Сургут",
    title: "Просторная двушка в центре",
    description: "Двухкомнатная квартира в центре города. Рядом ТЦ Сити Молл и парк. Хороший ремонт, вся мебель и техника.",
    type: ListingType.APARTMENT,
    basePrice: 48000,
    rooms: 2,
    area: 56,
    floor: 5,
    totalFloors: 10,
  },
  {
    city: "Сургут",
    title: "Студия для командировочных",
    description: "Компактная студия идеально для деловых поездок. Рядом офисы нефтяных компаний. Wi-Fi, рабочее место, кухня.",
    type: ListingType.STUDIO,
    basePrice: 28000,
    rooms: 1,
    area: 25,
    floor: 3,
    totalFloors: 9,
  },
  {
    city: "Сургут",
    title: "Семейная квартира с балконом",
    description: "Трёхкомнатная квартира для семьи. Большая кухня, два балкона. Тихий спальный район. Рядом лес и лыжная база.",
    type: ListingType.APARTMENT,
    basePrice: 55000,
    rooms: 3,
    area: 75,
    floor: 7,
    totalFloors: 12,
  },
];

const KAZAN_LISTINGS: ListingData[] = [
  {
    city: "Казань",
    title: "Квартира у Кремля",
    description: "Стильная квартира в пешей доступности от Казанского Кремля. Современный ремонт в восточном стиле. Рядом улица Баумана.",
    type: ListingType.APARTMENT,
    basePrice: 45000,
    rooms: 1,
    area: 40,
    floor: 4,
    totalFloors: 9,
  },
  {
    city: "Казань",
    title: "Апартаменты с видом на Казанку",
    description: "Панорамные апартаменты с видом на реку и стадион. Новый дом, подземный паркинг. Идеально для болельщиков.",
    type: ListingType.APARTMENT,
    basePrice: 58000,
    rooms: 2,
    area: 60,
    floor: 18,
    totalFloors: 25,
  },
  {
    city: "Казань",
    title: "Уютная студия на Чернышевского",
    description: "Небольшая студия в историческом центре. Рядом метро, кафе и магазины. Отличный вариант для туристов.",
    type: ListingType.STUDIO,
    basePrice: 32000,
    rooms: 1,
    area: 26,
    floor: 2,
    totalFloors: 5,
  },
];

const EKB_LISTINGS: ListingData[] = [
  {
    city: "Екатеринбург",
    title: "Квартира в Екатеринбург-Сити",
    description: "Современная квартира в деловом центре. Рядом Ельцин Центр и набережная. Панорамное остекление, умный дом.",
    type: ListingType.APARTMENT,
    basePrice: 52000,
    rooms: 1,
    area: 45,
    floor: 20,
    totalFloors: 30,
  },
  {
    city: "Екатеринбург",
    title: "Двушка на Плотинке",
    description: "Уютная двухкомнатная квартира рядом с Плотинкой. Исторический центр, рядом музеи и театры. Камерная атмосфера.",
    type: ListingType.APARTMENT,
    basePrice: 42000,
    rooms: 2,
    area: 52,
    floor: 3,
    totalFloors: 5,
  },
];

async function main() {
  console.log("🚀 Начинаем создание тестовых объявлений...\n");

  // Найти существующего пользователя (владельца объявлений)
  const existingUser = await prisma.user.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  if (!existingUser) {
    console.error("❌ Не найден ни один активный пользователь в базе!");
    console.error("   Сначала создайте пользователя или запустите основной seed.");
    process.exit(1);
  }

  console.log(`✅ Используем пользователя: ${existingUser.email || existingUser.id}\n`);

  // Объединяем все объявления
  const allListings = [
    ...MOSCOW_LISTINGS,
    ...SPB_LISTINGS,
    ...SURGUT_LISTINGS,
    ...KAZAN_LISTINGS,
    ...EKB_LISTINGS,
  ];

  // Проверка amenities
  const wifi = await prisma.amenity.findUnique({ where: { key: "wifi" } });
  const kitchen = await prisma.amenity.findUnique({ where: { key: "kitchen" } });
  const parking = await prisma.amenity.findUnique({ where: { key: "parking" } });

  let createdCount = 0;

  for (let i = 0; i < allListings.length; i++) {
    const data = allListings[i];
    const listingId = `test-listing-${i + 1}`;

    // Случайные данные
    const viewsCount = 0;
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Выбираем 2-3 фото для объявления
    const photoCount = 2 + Math.floor(Math.random() * 2); // 2 или 3
    const photoStartIndex = (i * 3) % APARTMENT_PHOTOS.length;
    const photos: string[] = [];
    for (let p = 0; p < photoCount; p++) {
      const photoIndex = (photoStartIndex + p) % APARTMENT_PHOTOS.length;
      photos.push(APARTMENT_PHOTOS[photoIndex]);
    }

    try {
      // Проверяем, существует ли уже
      const existing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (existing) {
        console.log(`⏭️  Пропуск: ${data.title} (уже существует)`);
        continue;
      }

      // Создаём объявление
      const listing = await prisma.listing.create({
        data: {
          id: listingId,
          ownerId: existingUser.id,
          title: data.title,
          description: data.description,
          city: data.city,
          type: data.type,
          basePrice: data.basePrice,
          currency: "RUB",
          capacityGuests: data.rooms + 1,
          bedrooms: data.rooms,
          beds: data.rooms,
          bathrooms: data.rooms > 2 ? 2 : 1,
          status: ListingStatus.PUBLISHED,
          viewsCount,
          createdAt,
          photos: {
            create: photos.map((url, idx) => ({
              url,
              sortOrder: idx,
            })),
          },
        },
      });

      // Добавляем amenities (если существуют)
      const amenityIds: string[] = [];
      if (wifi) amenityIds.push(wifi.id);
      if (kitchen) amenityIds.push(kitchen.id);
      if (parking && Math.random() > 0.5) amenityIds.push(parking.id);

      for (const amenityId of amenityIds) {
        await prisma.listingAmenity.upsert({
          where: { listingId_amenityId: { listingId: listing.id, amenityId } },
          update: {},
          create: { listingId: listing.id, amenityId },
        });
      }

      createdCount++;
      console.log(`✅ ${createdCount}. ${data.city} — ${data.title} (${photos.length} фото, ${viewsCount} просмотров)`);
    } catch (error: any) {
      console.error(`❌ Ошибка создания "${data.title}": ${error.message}`);
    }
  }

  console.log(`\n🎉 Готово! Создано объявлений: ${createdCount}`);
  console.log("\n📋 Итог по городам:");
  console.log(`   • Москва: ${MOSCOW_LISTINGS.length}`);
  console.log(`   • Санкт-Петербург: ${SPB_LISTINGS.length}`);
  console.log(`   • Сургут: ${SURGUT_LISTINGS.length}`);
  console.log(`   • Казань: ${KAZAN_LISTINGS.length}`);
  console.log(`   • Екатеринбург: ${EKB_LISTINGS.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Критическая ошибка:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
