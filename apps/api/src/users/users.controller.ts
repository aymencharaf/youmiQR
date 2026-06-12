import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UsersService } from './users.service'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.users.profile(userId)
  }

  @Post('me/addresses')
  addAddress(@CurrentUser('userId') userId: string, @Body() body: any) {
    return this.users.addAddress(userId, body)
  }
}
