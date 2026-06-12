import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { createHash } from 'crypto'

/**
 * خدمة رفع الصور إلى Cloudinary عبر التوقيع الموقّع (signed upload).
 * الواجهة ترفع الملف مباشرة إلى Cloudinary باستخدام التوقيع الصادر من هنا.
 * اضبط: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
@Injectable()
export class UploadsService {
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
  private readonly apiKey = process.env.CLOUDINARY_API_KEY || ''
  private readonly apiSecret = process.env.CLOUDINARY_API_SECRET || ''

  get isConfigured() {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret)
  }

  /** إصدار توقيع رفع لمجلد معيّن. */
  signUpload(folder = 'youmi') {
    if (!this.isConfigured) {
      throw new InternalServerErrorException('خدمة الرفع غير مضبوطة (Cloudinary)')
    }
    const timestamp = Math.floor(Date.now() / 1000)
    // المعاملات تُرتّب أبجدياً ثم تُوقّع بـ SHA-1
    const toSign = `folder=${folder}&timestamp=${timestamp}${this.apiSecret}`
    const signature = createHash('sha1').update(toSign).digest('hex')
    const uploadUrl =
      'https://api.cloudinary.com/v1_1/' + this.cloudName + '/image/upload'
    return {
      cloudName: this.cloudName,
      apiKey: this.apiKey,
      timestamp,
      folder,
      signature,
      uploadUrl,
    }
  }
}
