import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator'
import { UserRole } from '@youmi/db'

// Algerian phone: 0[5-7]xxxxxxxx
const DZ_PHONE = /^0[5-7][0-9]{8}$/

export class RegisterDto {
  @Matches(DZ_PHONE, { message: 'رقم الهاتف غير صالح (مثال: 0550123456)' })
  phone!: string

  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string

  @IsString()
  @MinLength(2, { message: 'الاسم قصير جداً' })
  fullName!: string

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password!: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

export class LoginDto {
  @Matches(DZ_PHONE, { message: 'رقم الهاتف غير صالح' })
  phone!: string

  @IsString()
  password!: string
}

export class RefreshDto {
  @IsString()
  refreshToken!: string
}
