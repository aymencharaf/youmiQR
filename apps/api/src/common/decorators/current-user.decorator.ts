import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtUser {
  userId: string
  role: string
  vendorId?: string | null
}

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user as JwtUser
    return data ? user?.[data] : user
  },
)
