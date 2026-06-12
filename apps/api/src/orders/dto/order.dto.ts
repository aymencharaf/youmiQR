import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator'
import { PaymentMethod, ShippingType } from '@youmi/db'

export class OrderItemInput {
  @IsString() productId!: string
  @IsOptional() @IsString() variantId?: string
  @IsInt() @Min(1) quantity!: number
}

export class CreateOrderDto {
  @IsString() addressId!: string
  @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod
  @IsEnum(ShippingType) shippingType: ShippingType = ShippingType.HOME
  @IsOptional() @IsString() courier?: string
  @IsOptional() @IsString() couponCode?: string
  @IsOptional() @IsString() notes?: string
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items!: OrderItemInput[]
}
