import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class ReviewMetricInputDto {
  @ApiProperty({ example: "cleanliness" })
  @IsString()
  metricKey!: string;

  @ApiProperty({ example: 80, description: "0..100" })
  @IsInt()
  @Min(0)
  @Max(100)
  value!: number;
}

export class CreateReviewDto {
  @ApiProperty({ example: "listing-uuid" })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: 5, description: "1..5" })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: "Отличная квартира, тихо и чисто" })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ type: [ReviewMetricInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ReviewMetricInputDto)
  metrics!: ReviewMetricInputDto[];
}

