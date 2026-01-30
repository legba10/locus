import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "guest@locus.local" })
  @IsDefined()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsDefined()
  @IsString()
  @MinLength(6)
  password!: string;
}

