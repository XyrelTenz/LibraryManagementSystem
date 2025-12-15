import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  REMINDER = 'reminder',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType = NotificationType.INFO;

  // Custom Data for ROUTING
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
