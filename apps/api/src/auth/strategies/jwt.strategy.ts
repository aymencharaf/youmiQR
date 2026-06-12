import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

export interface JwtPayload {
  sub: string
  role: string
  vendorId?: string | null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
    })
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, role: payload.role, vendorId: payload.vendorId }
  }
}
