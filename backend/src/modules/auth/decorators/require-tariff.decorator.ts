import { Tariffs } from "./tariff.decorator";

export const RequireTariff = (...tariffs: string[]) => Tariffs(...tariffs);
