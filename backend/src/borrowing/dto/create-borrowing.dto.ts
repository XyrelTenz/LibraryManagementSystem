import { IsInt, IsUUID, IsISO8601 } from 'class-validator';

export class CreateBorrowDto {
  @IsInt()
  bookId: number;

  @IsUUID()
  userId: string;

  @IsISO8601()
  dueDate: string;
}
