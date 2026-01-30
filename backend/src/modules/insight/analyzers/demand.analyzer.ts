import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface DemandInput {
  city: string;
  price: number;
  amenities: any[];
  qualityScore: number;
}

interface DemandResult {
  level: 'low' | 'medium' | 'high';
  bookingProbability: number; // 0-100
  reasoning: string[];
}

/**
 * Анализатор спроса
 * Оценивает вероятность бронирования
 */
@Injectable()
export class DemandAnalyzer {
  // Коэффициенты спроса по городам (в реальности — из аналитики)
  private readonly cityDemand: Record<string, number> = {
    'Москва': 0.85,
    'Moscow': 0.85,
    'Санкт-Петербург': 0.80,
    'Saint Petersburg': 0.80,
    'Сочи': 0.90,
    'Sochi': 0.90,
    'Казань': 0.70,
    'Kazan': 0.70,
    'Краснодар': 0.75,
    'default': 0.65,
  };

  constructor(private readonly prisma: PrismaService) {}

  async analyze(input: DemandInput): Promise<DemandResult> {
    const reasoning: string[] = [];
    
    const baseFactor = (this.cityDemand[input.city] ?? this.cityDemand['default']) ?? 0.5;
    let probability = baseFactor * 100;
    
    // Корректировка на качество
    if (input.qualityScore >= 80) {
      probability += 15;
      reasoning.push('Высокое качество объявления повышает интерес');
    } else if (input.qualityScore >= 60) {
      probability += 8;
    } else if (input.qualityScore < 40) {
      probability -= 15;
      reasoning.push('Улучшите объявление для повышения спроса');
    }

    // Корректировка на удобства
    const amenitiesCount = input.amenities?.length ?? 0;
    if (amenitiesCount >= 8) {
      probability += 10;
      reasoning.push('Много удобств привлекает гостей');
    } else if (amenitiesCount < 3) {
      probability -= 10;
      reasoning.push('Добавьте удобства для повышения привлекательности');
    }

    // Ограничиваем 0-100
    probability = Math.max(10, Math.min(95, probability));

    // Определяем уровень
    let level: 'low' | 'medium' | 'high';
    if (probability >= 70) {
      level = 'high';
      reasoning.unshift('Высокий спрос в этом районе');
    } else if (probability >= 45) {
      level = 'medium';
      reasoning.unshift('Средний спрос');
    } else {
      level = 'low';
      reasoning.unshift('Низкий спрос — рассмотрите снижение цены');
    }

    return {
      level,
      bookingProbability: Math.round(probability),
      reasoning,
    };
  }

  /**
   * Получить уровень спроса для города
   */
  async getCityDemand(city: string): Promise<'low' | 'medium' | 'high'> {
    const factor = (this.cityDemand[city] ?? this.cityDemand['default']) ?? 0.5;
    if (factor >= 0.80) return 'high';
    if (factor >= 0.65) return 'medium';
    return 'low';
  }
}
