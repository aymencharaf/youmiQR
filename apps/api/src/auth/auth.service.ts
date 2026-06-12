import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'
import { UserRole } from '@youmi/db'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private async issueTokens(user: { id: string; role: string }, vendorId?: string | null) {
    const payload = { sub: user.id, role: user.role, vendorId: vendorId ?? null }
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    })
    const refreshToken = randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })
    return { accessToken, refreshToken }
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])] },
    })
    if (exists) throw new ConflictException('رقم الهاتف أو البريد مسجل مسبقاً')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: dto.role === UserRole.VENDOR ? UserRole.VENDOR : UserRole.CUSTOMER,
      },
    })
    const tokens = await this.issueTokens(user)
    return { user: this.sanitize(user), ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { vendor: true },
    })
    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة')
    const ok = await bcrypt.compare(dto.password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('بيانات الدخول غير صحيحة')
    if (!user.isActive) throw new UnauthorizedException('الحساب معطل')
    const tokens = await this.issueTokens(user, user.vendor?.id)
    return { user: this.sanitize(user), ...tokens }
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { vendor: true } } },
    })
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('جلسة منتهية، يرجى تسجيل الدخول مجدداً')
    }
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    })
    const tokens = await this.issueTokens(stored.user, stored.user.vendor?.id)
    return { user: this.sanitize(stored.user), ...tokens }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken
      .updateMany({ where: { token: refreshToken }, data: { revoked: true } })
      .catch(() => {})
    return { success: true }
  }

  private sanitize(user: any) {
    const { passwordHash, ...rest } = user
    return rest
  }
}
