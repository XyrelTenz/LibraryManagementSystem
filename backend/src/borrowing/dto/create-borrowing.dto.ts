import { IsInt, IsUUID, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateBorrowingDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsISO8601()
  @IsNotEmpty()
  dueDate: string;
}
