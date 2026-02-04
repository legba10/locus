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
  @ApiProperty({ enum: ["user", "landlord"], example: "user" })
  @IsDefined()
  @IsIn(["user", "landlord"])
  role!: "user" | "landlord";

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

