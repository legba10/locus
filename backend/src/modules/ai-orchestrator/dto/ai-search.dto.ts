import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDefined, IsOptional, IsString, ValidateNested } from "class-validator";
import { AiContextDto } from "./ai-context.dto";

export class AiSearchRequestDto {
  @ApiProperty({
    description: "Natural language query. Example: 'Мне нужна тихая квартира рядом с метро до 50k на месяц'",
    example: "тихо, метро, до 50k",
  })
  @IsDefined()
  @IsString()
  query!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AiContextDto)
  context?: AiContextDto;
}

