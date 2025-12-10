import { IsString, IsInt, IsOptional, IsArray, IsUrl, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  isbn: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString() // Or @IsUrl() if you validate URLs
  coverImage?: string;

  @IsInt()
  @Min(0)
  totalCopies: number;

  @IsOptional()
  @IsString()
  qrCode?: string;

  // Array of Author IDs to link existing authors
  @IsArray()
  @IsInt({ each: true })
  authorIds: number[];

  // Optional Category ID
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
