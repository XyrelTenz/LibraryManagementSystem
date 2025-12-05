import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate Token
    const accessToken = this.generateToken(user.id, user.role);

    return {
      accessToken,
      user, // Returns the user data (Password is hidden automatically by Entity)
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthEntity> {
    const { email, password, fullName } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User in DB
    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
      },
    });

    // Generate Token
    const accessToken = this.generateToken(user.id, user.role);

    return {
      accessToken,
      user,
    };
  }

  // Helper
  private generateToken(userId: string, role: string): string {
    const payload = { sub: userId, role: role };
    return this.jwtService.sign(payload);
  }
}
