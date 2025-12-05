import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'student@school.edu' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
