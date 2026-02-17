/**
 * ТЗ №5: mock AI — задержка 1–2 сек и возврат данных для автозаполнения формы.
 * Настоящий AI не подключаем.
 */
export interface MockAiResult {
  title: string;
  rooms: number;
  type: "apartment" | "room" | "house" | "studio";
  /** Упоминание кухни (для описания) */
  kitchen: boolean;
  /** Упоминание санузла */
  bathroom: boolean;
  /** Краткое описание для подстановки */
  description?: string;
}

export async function mockAnalyzePhotos(): Promise<MockAiResult> {
  await new Promise((r) => setTimeout(r, 1500));
  return {
    title: "Уютная квартира",
    rooms: 2,
    type: "apartment",
    kitchen: true,
    bathroom: true,
    description: "Уютная квартира с кухней и отдельным санузлом. Всё необходимое для комфортного проживания.",
  };
}
