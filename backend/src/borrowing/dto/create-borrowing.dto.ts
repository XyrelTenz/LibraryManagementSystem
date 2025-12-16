import { IsInt, IsUUID, IsISO8601, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBorrowingDto {
  @IsInt()
  @IsNotEmpty()
  @Type((): NumberConstructor => Number)
  bookId: number;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsISO8601()
  @IsNotEmpty()
  dueDate: string;
}
