import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { VendorsModule } from './vendors/vendors.module'
import { CategoriesModule } from './categories/categories.module'
import { ProductsModule } from './products/products.module'
import { OrdersModule } from './orders/orders.module'
import { ShippingModule } from './shipping/shipping.module'
import { AdminModule } from './admin/admin.module'
import { PaymentsModule } from './payments/payments.module'
import { NotificationsModule } from './notifications/notifications.module'
import { ChatModule } from './chat/chat.module'
import { CouponsModule } from './coupons/coupons.module'
import { InstallmentsModule } from './installments/installments.module'
import { UploadsModule } from './uploads/uploads.module'
import { SubscriptionsModule } from './subscriptions/subscriptions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    ShippingModule,
    AdminModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    CouponsModule,
    InstallmentsModule,
    UploadsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
