import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchQueryDto {
  @ApiPropertyOptional({ example: "Moscow" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "тихо метро" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Минимальная цена за ночь", example: 2000 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ description: "Максимальная цена за ночь", example: 5000 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ description: "Количество гостей", example: 2 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  guests?: number;

  @ApiPropertyOptional({ enum: ["APARTMENT", "HOUSE", "ROOM", "STUDIO"] })
  @IsOptional()
  @IsIn(["APARTMENT", "HOUSE", "ROOM", "STUDIO"])
  type?: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO";

  @ApiPropertyOptional({ description: "Количество комнат", example: 2 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  rooms?: number;

  @ApiPropertyOptional({ description: "amenities keys csv", example: "wifi,parking" })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiPropertyOptional({ enum: ["newest", "price_asc", "price_desc"], default: "newest" })
  @IsOptional()
  @IsIn(["newest", "price_asc", "price_desc"])
  sort?: "newest" | "price_asc" | "price_desc";

  @ApiPropertyOptional({ description: "Use AI search reranking", example: "1" })
  @IsOptional()
  @IsIn(["0", "1"])
  ai?: "0" | "1";

  @ApiPropertyOptional({ description: "Page number (1-based)", example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Page size (max 50)", example: 20, default: 50 })
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

// POST body for advanced search
export class SearchBodyDto {
  @ApiPropertyOptional({ example: "Москва" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  guests?: number;

  @ApiPropertyOptional({ enum: ["APARTMENT", "HOUSE", "ROOM", "STUDIO"] })
  @IsOptional()
  @IsIn(["APARTMENT", "HOUSE", "ROOM", "STUDIO"])
  type?: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO";

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  rooms?: number;

  @ApiPropertyOptional({ example: "тихая квартира у метро" })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  useAi?: boolean;

  @ApiPropertyOptional({ example: ["wifi", "parking"] })
  @IsOptional()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ enum: ["relevance", "price_asc", "price_desc", "rating", "ai_score"], default: "relevance" })
  @IsOptional()
  @IsIn(["relevance", "price_asc", "price_desc", "rating", "ai_score"])
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "ai_score";
}