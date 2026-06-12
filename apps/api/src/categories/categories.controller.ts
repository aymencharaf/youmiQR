import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '@youmi/db'

@Controller('categories')
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get()
  findAll() {
    return this.categories.findAll()
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.categories.create(body)
  }
}
