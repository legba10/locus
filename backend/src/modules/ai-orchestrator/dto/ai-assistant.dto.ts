import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { AiContextDto } from "./ai-context.dto";

export class AiAssistantRequestDto {
  @ApiProperty({ enum: ["guest", "host", "admin"], example: "guest" })
  @IsDefined()
  @IsIn(["guest", "host", "admin"])
  role!: "guest" | "host" | "admin";

  @ApiProperty({ example: "Почему это жильё подходит? Какие риски?" })
  @IsDefined()
  @IsString()
  message!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AiContextDto)
  context?: AiContextDto;

  @ApiPropertyOptional({ description: "Arbitrary JSON context (listingId, bookingId etc.)" })
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;
}

