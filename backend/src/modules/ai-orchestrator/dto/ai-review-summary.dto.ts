import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";

export class AiReviewMetricDto {
  @ApiProperty({ example: "cleanliness" })
  @IsString()
  metricKey!: string;

  @ApiProperty({ example: 82 })
  @IsInt()
  @Min(0)
  @Max(100)
  avgValue!: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(0)
  count!: number;
}

export class AiReviewSummaryDto {
  @ApiProperty({ type: [AiReviewMetricDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiReviewMetricDto)
  metrics!: AiReviewMetricDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  texts?: string[];
}

