import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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
}
