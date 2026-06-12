import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats()
  }

  @Get('vendors')
  vendors(@Query('status') status?: string) {
    return this.admin.listVendors(status)
  }

  @Patch('vendors/:id/status')
  setVendorStatus(
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  ) {
    return this.admin.setVendorStatus(id, status)
  }

  @Get('users')
  users() {
    return this.admin.listUsers()
  }

  @Get('orders')
  orders() {
    return this.admin.listOrders()
  }
}
