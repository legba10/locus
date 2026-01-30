import bcrypt from "bcryptjs";
import {
  BookingStatus,
  ListingStatus,
  PrismaClient,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// Проверка, что Prisma Client сгенерирован
if (!prisma.propertyIntelligence) {
  console.error('❌ Prisma Client не сгенерирован!');
  console.error('Выполните: npx prisma generate');
  process.exit(1);
}

/**
 * Generate AI scores for a listing (heuristic MVP)
 */
function generateAIScores(listing: {
  basePrice: number;
  description: string;
  photos: string[];
  amenityKeys: string[];
  capacityGuests: number;
}) {
  // Quality score based on listing completeness
  let qualityScore = 50;
  qualityScore += listing.description.length > 100 ? 20 : 5;
  qualityScore += listing.photos.length * 10;
  qualityScore += listing.amenityKeys.length * 5;
  qualityScore = Math.min(100, Math.max(0, qualityScore));

  // Demand score (simulated)
  const demandScore = 40 + Math.floor(Math.random() * 40);

  // Risk score (lower is better)
  const riskScore = 10 + Math.floor(Math.random() * 30);

  // Completeness score
  let completenessScore = 0;
  if (listing.description.length > 50) completenessScore += 30;
  if (listing.photos.length > 0) completenessScore += 30;
  if (listing.amenityKeys.length > 2) completenessScore += 20;
  completenessScore += 20; // base

  // Price analysis (simulated market comparison)
  const avgMarketPrice = 3500; // baseline for Moscow
  const priceDeltaPercent = ((listing.basePrice - avgMarketPrice) / avgMarketPrice) * 100;
  const marketPosition = priceDeltaPercent < -5 ? "below_market" : priceDeltaPercent > 5 ? "above_market" : "at_market";

  // Booking probability
  const bookingProbability = Math.min(0.95, Math.max(0.1, (qualityScore / 100) * 0.7 + (demandScore / 100) * 0.3));

  // Recommended price
  const recommendedPrice = Math.round(avgMarketPrice * (1 + (qualityScore - 50) / 100));

  // Revenue forecast
  const revenueForecast30d = Math.round(listing.basePrice * bookingProbability * 20); // ~20 bookable days

  // Generate verdict
  const score = Math.round((qualityScore * 0.4 + demandScore * 0.3 + (100 - riskScore) * 0.2 + completenessScore * 0.1));
  let verdict = "average";
  if (score >= 80) verdict = "excellent";
  else if (score >= 65) verdict = "good";
  else if (score < 50) verdict = "needs_improvement";

  // Generate pros/cons/risks
  const pros: string[] = [];
  const cons: string[] = [];
  const risks: string[] = [];
  const tips: string[] = [];

  if (priceDeltaPercent < -5) pros.push("Цена ниже рынка");
  if (priceDeltaPercent > 10) cons.push("Цена выше рынка");
  if (qualityScore >= 70) pros.push("Качественное объявление");
  if (qualityScore < 50) cons.push("Объявление требует улучшения");
  if (demandScore >= 60) pros.push("Высокий спрос в районе");
  if (demandScore < 40) risks.push("Низкий спрос в этом районе");
  if (listing.photos.length < 3) tips.push("Добавьте больше фото");
  if (listing.description.length < 100) tips.push("Расширьте описание");
  if (listing.amenityKeys.length < 3) tips.push("Добавьте удобства");

  // Default entries if empty
  if (pros.length === 0) pros.push("Стандартный вариант");
  if (cons.length === 0) cons.push("Нет существенных недостатков");

  return {
    qualityScore,
    demandScore,
    riskScore,
    completenessScore,
    bookingProbability,
    recommendedPrice,
    priceDeltaPercent: Math.round(priceDeltaPercent * 10) / 10,
    revenueForecast30d,
    marketPosition,
    avgMarketPrice,
    riskLevel: riskScore < 25 ? "low" : riskScore < 50 ? "medium" : "high",
    score,
    verdict,
    pros,
    cons,
    risks,
    tips,
    demand: demandScore >= 60 ? "high" : demandScore >= 40 ? "medium" : "low",
  };
}

function startOfDayUtc(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}

// Cache for roles to avoid race conditions
const rolesCache: Record<string, { id: string }> = {};

async function ensureRoles() {
  const roleNames = ["guest", "host", "admin"] as const;
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
    rolesCache[name] = role;
  }
}

async function upsertUser(params: { email: string; name: string; role: "guest" | "host" | "admin" }) {
  const role = rolesCache[params.role];
  if (!role) throw new Error(`Role ${params.role} not found in cache`);
  
  const passwordHash = await bcrypt.hash("password123", 10);

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      email: params.email,
      status: UserStatus.ACTIVE,
      passwordHash,
      profile: { create: { name: params.name } },
      roles: { create: { roleId: role.id } },
    },
  });
}

async function main() {
  // First ensure all roles exist (sequential to avoid race)
  await ensureRoles();
  
  // Then create users (can be parallel now)
  const [host1, host2, guest1, guest2, admin] = await Promise.all([
    upsertUser({ email: "host1@locus.local", name: "Host One", role: "host" }),
    upsertUser({ email: "host2@locus.local", name: "Host Two", role: "host" }),
    upsertUser({ email: "guest1@locus.local", name: "Guest One", role: "guest" }),
    upsertUser({ email: "guest2@locus.local", name: "Guest Two", role: "guest" }),
    upsertUser({ email: "admin@locus.local", name: "Admin", role: "admin" }),
  ]);

  // Amenities catalog
  const amenityKeys = ["wifi", "parking", "kitchen", "pets", "balcony"];
  for (const key of amenityKeys) {
    await prisma.amenity.upsert({
      where: { key },
      update: {},
      create: { key, label: key },
    });
  }

  const listingsSeed = Array.from({ length: 10 }).map((_, i) => {
    const idx = i + 1;
    const ownerId = idx <= 5 ? host1.id : host2.id;
    const city = "Moscow";
    const basePrice = 2500 + idx * 250;
    const title =
      idx % 2 === 0 ? `Современная квартира #${idx}` : `Уютная квартира #${idx}`;
    const description =
      idx % 2 === 0
        ? "5–7 минут до метро. Удобно для города. Есть wi-fi."
        : "Тихий двор, спокойный район. Подходит для работы и отдыха.";

    return {
      id: `seed-listing-${idx}`,
      ownerId,
      title,
      description,
      city,
      basePrice,
      currency: "RUB",
      capacityGuests: idx % 3 === 0 ? 4 : 2,
      bedrooms: idx % 3 === 0 ? 2 : 1,
      beds: idx % 3 === 0 ? 2 : 1,
      bathrooms: 1,
      status: idx === 10 ? ListingStatus.DRAFT : ListingStatus.PUBLISHED,
      lat: 55.75 + idx * 0.001,
      lng: 37.61 + idx * 0.001,
      amenityKeys:
        idx % 3 === 0 ? ["wifi", "kitchen", "parking"] : ["wifi", "kitchen"],
      photos: [`https://picsum.photos/seed/locus-${idx}/1200/800`],
    };
  });

  for (const l of listingsSeed) {
    const listing = await prisma.listing.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        ownerId: l.ownerId,
        title: l.title,
        description: l.description,
        city: l.city,
        basePrice: l.basePrice,
        currency: l.currency,
        capacityGuests: l.capacityGuests,
        bedrooms: l.bedrooms,
        beds: l.beds,
        bathrooms: l.bathrooms,
        status: l.status,
        lat: l.lat,
        lng: l.lng,
        photos: { create: l.photos.map((url, i) => ({ url, sortOrder: i })) },
      },
    });

    // link amenities
    for (const key of l.amenityKeys) {
      const amenity = await prisma.amenity.findUnique({ where: { key } });
      if (!amenity) continue;
      await prisma.listingAmenity.upsert({
        where: { listingId_amenityId: { listingId: listing.id, amenityId: amenity.id } },
        update: {},
        create: { listingId: listing.id, amenityId: amenity.id },
      });
    }

    // availability: next 60 days available
    const start = startOfDayUtc(new Date());
    const days = Array.from({ length: 60 }).map((_, i) => ({
      listingId: listing.id,
      date: new Date(start.getTime() + i * 24 * 60 * 60 * 1000),
      isAvailable: true,
    }));
    await prisma.availabilityDay.createMany({ data: days, skipDuplicates: true });

    // Generate AI scores and create PropertyIntelligence
    const aiData = generateAIScores(l);
    
    // Create PropertyIntelligence
    try {
      await (prisma as any).propertyIntelligence.upsert({
        where: { listingId: listing.id },
        update: {
          qualityScore: aiData.qualityScore,
          demandScore: aiData.demandScore,
          riskScore: aiData.riskScore,
          completenessScore: aiData.completenessScore,
          bookingProbability: aiData.bookingProbability,
          recommendedPrice: aiData.recommendedPrice,
          priceDeltaPercent: aiData.priceDeltaPercent,
          revenueForecast30d: aiData.revenueForecast30d,
          marketPosition: aiData.marketPosition,
          competitorCount: 15 + Math.floor(Math.random() * 20),
          avgMarketPrice: aiData.avgMarketPrice,
          riskFactors: aiData.risks,
          riskLevel: aiData.riskLevel,
          explanation: {
            text: `Оценка ${aiData.score}/100 - ${aiData.verdict === 'excellent' ? 'Отличный вариант' : aiData.verdict === 'good' ? 'Хороший вариант' : 'Средний вариант'}`,
            bullets: aiData.pros,
            suggestions: aiData.tips,
          },
          lastCalculatedAt: new Date(),
        },
        create: {
          listingId: listing.id,
          qualityScore: aiData.qualityScore,
          demandScore: aiData.demandScore,
          riskScore: aiData.riskScore,
          completenessScore: aiData.completenessScore,
          bookingProbability: aiData.bookingProbability,
          recommendedPrice: aiData.recommendedPrice,
          priceDeltaPercent: aiData.priceDeltaPercent,
          revenueForecast30d: aiData.revenueForecast30d,
          marketPosition: aiData.marketPosition,
          competitorCount: 15 + Math.floor(Math.random() * 20),
          avgMarketPrice: aiData.avgMarketPrice,
          riskFactors: aiData.risks,
          riskLevel: aiData.riskLevel,
          explanation: {
            text: `Оценка ${aiData.score}/100 - ${aiData.verdict === 'excellent' ? 'Отличный вариант' : aiData.verdict === 'good' ? 'Хороший вариант' : 'Средний вариант'}`,
            bullets: aiData.pros,
            suggestions: aiData.tips,
          },
          lastCalculatedAt: new Date(),
        },
      });
    } catch (error: any) {
      if (error?.message?.includes('propertyIntelligence') || error?.message?.includes('Cannot read properties')) {
        console.error('\n❌ ОШИБКА: Prisma Client не сгенерирован!');
        console.error('\n📋 Решение:');
        console.error('   1. Выполните: npx prisma generate');
        console.error('   2. Затем снова: npm run db:seed\n');
        throw error;
      }
      throw error;
    }

    // Create ListingInsight
    await prisma.listingInsight.upsert({
      where: { listingId: listing.id },
      update: {
        score: aiData.score,
        verdict: aiData.verdict,
        priceDiff: aiData.priceDeltaPercent,
        pros: aiData.pros,
        cons: aiData.cons,
        risks: aiData.risks,
        demand: aiData.demand,
        bookingProbability: aiData.bookingProbability,
        recommendedPrice: aiData.recommendedPrice,
        tips: aiData.tips,
      },
      create: {
        listingId: listing.id,
        score: aiData.score,
        verdict: aiData.verdict,
        priceDiff: aiData.priceDeltaPercent,
        pros: aiData.pros,
        cons: aiData.cons,
        risks: aiData.risks,
        demand: aiData.demand,
        bookingProbability: aiData.bookingProbability,
        recommendedPrice: aiData.recommendedPrice,
        tips: aiData.tips,
      },
    });

    // Create AiListingScore
    await prisma.aiListingScore.upsert({
      where: { listingId: listing.id },
      update: {
        qualityScore: aiData.qualityScore,
        riskScore: aiData.riskScore,
        demandScore: aiData.demandScore,
        priceScore: Math.round(100 - Math.abs(aiData.priceDeltaPercent) * 2),
      },
      create: {
        listingId: listing.id,
        qualityScore: aiData.qualityScore,
        riskScore: aiData.riskScore,
        demandScore: aiData.demandScore,
        priceScore: Math.round(100 - Math.abs(aiData.priceDeltaPercent) * 2),
      },
    });

    console.log(`Created AI data for listing ${listing.id}: score=${aiData.score}, verdict=${aiData.verdict}`);
  }

  // 10 bookings (mix pending/confirmed) on published listings
  const publishedListingIds = listingsSeed
    .filter((l) => l.status === ListingStatus.PUBLISHED)
    .map((l) => l.id);

  for (let i = 0; i < 10; i++) {
    const listingId = publishedListingIds[i % publishedListingIds.length]!;
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) continue;

    const checkIn = startOfDayUtc(new Date(Date.now() + (3 + i * 2) * 24 * 60 * 60 * 1000));
    const checkOut = startOfDayUtc(new Date(checkIn.getTime() + 2 * 24 * 60 * 60 * 1000));
    const totalPrice = listing.basePrice * 2;

    await prisma.booking.upsert({
      where: { id: `seed-booking-${i + 1}` },
      update: {},
      create: {
        id: `seed-booking-${i + 1}`,
        listingId: listing.id,
        guestId: i % 2 === 0 ? guest1.id : guest2.id,
        hostId: listing.ownerId,
        checkIn,
        checkOut,
        guestsCount: 2,
        totalPrice,
        currency: listing.currency,
        status: i % 3 === 0 ? BookingStatus.PENDING : BookingStatus.CONFIRMED,
        priceBreakdown: { nights: 2, subtotal: totalPrice, currency: listing.currency },
      },
    });
  }

  // Keep admin referenced to avoid "unused" warnings in some setups
  void admin;
}

main()
  .then(async () => {
    console.log('\n✅ Seed выполнен успешно!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('\n❌ Ошибка при выполнении seed:');
    if (e?.message?.includes('propertyIntelligence') || e?.message?.includes('Cannot read properties')) {
      console.error('\n📋 Prisma Client не сгенерирован!');
      console.error('   Выполните: npx prisma generate');
      console.error('   Затем снова: npm run db:seed\n');
    } else {
      console.error(e);
    }
    await prisma.$disconnect();
    process.exit(1);
  });

