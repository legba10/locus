import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: "Цена за ночь" })
  @IsOptional()
  @IsInt()
  @Min(1)
  basePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  capacityGuests?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  beds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({ description: "Произвольные правила (JSON)" })
  @IsOptional()
  houseRules?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ["APARTMENT", "HOUSE", "ROOM", "STUDIO"] })
  @IsOptional()
  @IsIn(["APARTMENT", "HOUSE", "ROOM", "STUDIO"])
  type?: "APARTMENT" | "HOUSE" | "ROOM" | "STUDIO";

  @ApiPropertyOptional({ example: ["wifi", "parking"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityKeys?: string[];
}

