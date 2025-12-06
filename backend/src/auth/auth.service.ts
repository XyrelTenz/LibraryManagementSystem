import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthEntity } from './entities/auth.entity';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generates Token
    const accessToken = this.generateToken(user.id, user.role);

    // const { password: _, ...userWithoutPassword } = user;

    /*
     * Return the object Directly
     * Controller's Intercepter will handle hiding the password
     * */
    return {
      accessToken,
      // user: userWithoutPassword as any,
      user,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthEntity> {
    const { email, password, fullName } = registerDto;

    // Check for duplicates before doing expensive work like HASHING
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
      },
    });

    // Generate Tokens diretly After use is logged in
    const accessToken = this.generateToken(user.id, user.role);

    // const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      // user: userWithoutPassword as any,
      user
    };
  }

  private generateToken(userId: string, role: string): string {
    const payload = { sub: userId, role: role };
    return this.jwtService.sign(payload);
  }
}
