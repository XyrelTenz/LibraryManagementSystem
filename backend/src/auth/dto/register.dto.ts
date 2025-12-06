import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../shared/enums/role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Xyrel D. Tenefrancia' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'xdemocrito1@jhcsc.edu.ph' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '@Demz123', minLength: 6 })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    enum: UserRole,
    required: false,
    description: 'Defaults to STUDENT if not provided'
  })
  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be valid (STUDENT, ADMIN, LIBRARIAN, FACULTY)',
  })
  role?: UserRole;
}
