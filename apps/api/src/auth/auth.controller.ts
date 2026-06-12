import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, RefreshDto } from './dto/auth.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator'
import { PrismaService } from '../prisma/prisma.service'

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken)
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: JwtUser) {
    const found = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: { vendor: true, wallet: true },
    })
    if (!found) return null
    const { passwordHash, ...rest } = found as any
    return rest
  }
}
