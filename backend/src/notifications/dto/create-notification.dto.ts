import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string; // Target User ID

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsOptional()
  type?: string = 'INFO'; // 'INFO', 'WARNING', 'ALERT'

  @IsObject()
  @IsOptional()
  data?: Record<string, any>; // e.g. { route: '/books/1' }
}
