import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from "../../prisma/prisma.service";
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true, // Makes JwtService available everywhere
      secret: process.env.JWT_SECRET || 'secretKey123', // Use .env in production
      signOptions: { expiresIn: '7d' }, // Token expires in 7 days
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
