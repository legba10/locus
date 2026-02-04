import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDefined, IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "newuser@locus.local" })
  @IsDefined()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsDefined()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ enum: ["user", "landlord"], default: "user" })
  @IsOptional()
  @IsIn(["user", "landlord"])
  role?: "user" | "landlord";

  @ApiPropertyOptional({ example: "Иван" })
  @IsOptional()
  @IsString()
  name?: string;
}

