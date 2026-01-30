import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator'

export class UploadPhotoDto {
  @IsString()
  @IsNotEmpty()
  url!: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number
}
