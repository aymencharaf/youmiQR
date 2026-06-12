import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { SubscriptionsService, type PlanInput } from './subscriptions.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  /** الخطط المتاحة للجميع. */
  @Get('plans')
  plans() {
    return this.subs.listActive()
  }

  /** المتاجر المشتركة (عام). */
  @Get('stores')
  stores() {
    return this.subs.subscribedStores()
  }

  // ===== إدارة الخطط (المدير) =====

  @Get('admin/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  allPlans() {
    return this.subs.listAll()
  }

  @Post('admin/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() body: PlanInput) {
    return this.subs.create(body)
  }

  @Patch('admin/plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  update(@Param('id') id: string, @Body() body: Partial<PlanInput>) {
    return this.subs.update(id, body)
  }

  @Delete('admin/plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.subs.remove(id)
  }

  @Patch('admin/vendors/:vendorId/plan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  assign(@Param('vendorId') vendorId: string, @Body('planId') planId: string) {
    return this.subs.assignVendor(vendorId, planId)
  }
}
