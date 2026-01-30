import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AiContextDto {
  @ApiPropertyOptional({ description: "Optional user id", example: "uuid" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "City context (if user selected it)", example: "Moscow" })
  @IsOptional()
  @IsString()
  city?: string;
}

