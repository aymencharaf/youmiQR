import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  /** يُرجع توقيع رفع للرفع المباشر إلى Cloudinary. */
  @Post('sign')
  sign(@Body('folder') folder?: string) {
    return this.uploads.signUpload(folder)
  }
}
