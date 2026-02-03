import { SetMetadata } from "@nestjs/common";

export const TARIFF_KEY = "tariffs";
export const Tariffs = (...tariffs: string[]) => SetMetadata(TARIFF_KEY, tariffs);
