import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { ProductType } from '@youmi/db'

export class VariantInput {
  @IsString() name!: string
  attributes!: Record<string, string>
  @IsNumber() price!: number
  @IsOptional() @IsString() sku?: string
  @IsOptional() @IsString() barcode?: string
  @IsInt() @Min(0) stock!: number
}

export class CreateProductDto {
  @IsString() @MinLength(2) name!: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsString() categoryId?: string
  @IsEnum(ProductType) type: ProductType = ProductType.SIMPLE
  @IsNumber() price!: number
  @IsOptional() @IsNumber() compareAtPrice?: number
  @IsOptional() @IsString() sku?: string
  @IsOptional() @IsString() barcode?: string
  @IsInt() @Min(0) stock = 0
  @IsOptional() @IsArray() images?: string[]
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInput)
  variants?: VariantInput[]
}

export class ListProductsQuery {
  @IsOptional() @IsString() q?: string
  @IsOptional() @IsString() categoryId?: string
  @IsOptional() @IsString() vendorId?: string
  @IsOptional() @Type(() => Number) @IsInt() page?: number
  @IsOptional() @Type(() => Number) @IsInt() limit?: number
}
