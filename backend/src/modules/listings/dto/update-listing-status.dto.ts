import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import type { CanonicalListingStatus } from "../listing-status.util";

export class UpdateListingStatusDto {
  @ApiProperty({ enum: ["draft", "moderation", "published", "rejected", "archived"] })
  @IsIn(["draft", "moderation", "published", "rejected", "archived"])
  status!: CanonicalListingStatus;

  @ApiPropertyOptional({ description: "Reason for reject/archive actions" })
  @IsOptional()
  @IsString()
  moderation_note?: string;
}
