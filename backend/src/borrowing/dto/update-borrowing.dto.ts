import { PartialType } from '@nestjs/mapped-types';
import { CreateBorrowingDto } from './create-borrowing.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBorrowingDto extends PartialType(CreateBorrowingDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  penalty?: number;

  @IsOptional()
  @IsBoolean()
  penaltyPaid?: boolean;
}
