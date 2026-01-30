import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsDefined, IsInt, IsString, Min } from "class-validator";

export class CreateBookingDto {
  @ApiProperty({ example: "uuid-listing-id" })
  @IsDefined()
  @IsString()
  listingId!: string;

  @ApiProperty({ example: "2026-02-01T00:00:00.000Z" })
  @IsDefined()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  checkIn!: Date;

  @ApiProperty({ example: "2026-02-05T00:00:00.000Z" })
  @IsDefined()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  checkOut!: Date;

  @ApiProperty({ example: 2 })
  @IsDefined()
  @IsInt()
  @Min(1)
  guestsCount!: number;
}

