import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { VendorsService } from './vendors.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { UserRole } from '@youmi/db'

@Controller('vendors')
export class VendorsController {
  constructor(private vendors: VendorsService) {}

  @Get(':slug')
  store(@Param('slug') slug: string) {
    return this.vendors.publicStore(slug)
  }

  @UseGuards(JwtAuthGuard)
  @Post('apply')
  apply(@CurrentUser('userId') userId: string, @Body() body: any) {
    return this.vendors.apply(userId, body)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @Get('me/dashboard')
  dashboard(@CurrentUser('vendorId') vendorId: string) {
    return this.vendors.dashboard(vendorId)
  }
}
