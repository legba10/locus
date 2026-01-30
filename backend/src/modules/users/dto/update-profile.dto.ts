import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Иван" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/avatar.png" })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

