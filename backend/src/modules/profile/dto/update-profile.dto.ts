import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Иван Иванов" })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: "Иван Иванов" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "+79991234567" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "https://cdn.../avatar.webp", description: "Avatar URL (optional)" })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({ example: "landlord", description: "Onboarding role selection: renter | landlord" })
  @IsOptional()
  @IsIn(["renter", "landlord"])
  role?: "renter" | "landlord";
}
