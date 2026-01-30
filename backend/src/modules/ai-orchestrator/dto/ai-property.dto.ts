import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsString } from "class-validator";

export class AiPropertyRequestDto {
  @ApiProperty({ example: "uuid-listing-id" })
  @IsDefined()
  @IsString()
  listingId!: string;
}

