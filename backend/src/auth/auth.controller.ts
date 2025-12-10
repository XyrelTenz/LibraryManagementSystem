import { Body, Controller, Post, HttpCode, HttpStatus, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthEntity } from './entities/auth.entity';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
// SRP - Only handles HTTP like (routes, status codes)
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // POST METHOD FOR LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() loginDto: LoginDto): Promise<AuthEntity> {
    return this.authService.login(loginDto);
  }

  // POST METHOD FOR REGISTER
  @Post('register')
  @ApiOkResponse({ type: AuthEntity })
  async register(@Body() registerDto: RegisterDto): Promise<AuthEntity> {
    return this.authService.register(registerDto);
  }
}
