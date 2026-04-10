import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database';
import { validationSchema } from './core/environment';
import { PromoCodesModule } from './domains/promo-codes/promo-codes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      isGlobal: true,
      validationSchema,
    }),
    DatabaseModule,
    PromoCodesModule,
  ],
})
export class AppModule {}
