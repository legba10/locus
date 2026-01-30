import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDefined,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";

export class AvailabilityPatchItemDto {
  @ApiProperty({ example: "2026-02-01T00:00:00.000Z" })
  @IsDefined()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date!: Date;

  @ApiProperty({ example: true })
  @IsDefined()
  @IsBoolean()
  isAvailable!: boolean;

  @ApiProperty({ required: false, example: 4000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceOverride?: number | null;
}

export class UpdateAvailabilityDto {
  @ApiProperty({ type: [AvailabilityPatchItemDto] })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityPatchItemDto)
  items!: AvailabilityPatchItemDto[];
}

