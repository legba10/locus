import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateListingPhotoDto {
  @ApiProperty({ example: "https://cdn.example.com/photo1.jpg" })
  @IsDefined()
  @IsString()
  url!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateListingDto {
  @ApiProperty({ example: "Тихая квартира у метро" })
  @IsDefined()
  @IsString()
  title!: string;

  @ApiProperty({ example: "Описание..." })
  @IsDefined()
  @IsString()
  description!: string;

  @ApiProperty({ example: "Moscow" })
  @IsDefined()
  @IsString()
  city!: string;

  @ApiPropertyOptional({ example: "ул. Тверская, район" })
  @IsOptional()
  @IsString()
  addressLine?: string;

  @ApiPropertyOptional({ example: 55.751244 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 37.618423 })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({ description: "Цена за ночь", example: 3500 })
  @IsDefined()
  @IsInt()
  @Min(1)
  basePrice!: number;

  @ApiPropertyOptional({ example: "RUB" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacityGuests?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  beds?: number;

  @ApiPropertyOptional({ example: 1 })
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

  @ApiPropertyOptional({ type: [CreateListingPhotoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListingPhotoDto)
  photos?: CreateListingPhotoDto[];
}

