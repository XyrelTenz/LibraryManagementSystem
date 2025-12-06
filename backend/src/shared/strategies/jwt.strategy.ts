import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY || "JWT",
    });
  }

  // Validate if TOKEN is valid otherwise FORBIDDED
  async validate(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
      email: payload.email
    };
  }
}
