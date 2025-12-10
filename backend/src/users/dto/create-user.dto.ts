import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../../shared/enums/role.enum";


export class CreateUserDTO {
  @ApiProperty({ example: "Xyrel D. Tenefrancia" })
  @IsString()
  @IsNotEmpty()
  fullName: string;


  @ApiProperty({ example: "xdemocrito1@jhcsc.edu.ph" })
  @IsEmail()
  email: string;



  @ApiProperty({ example: "@demz123", minLength: 6 })
  @MinLength(6)
  password: string;


  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  // Default to STUDENT in database if omitted
  @IsOptional()
  role?: UserRole

}
