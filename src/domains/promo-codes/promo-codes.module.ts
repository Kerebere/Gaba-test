import { Module } from '@nestjs/common';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesRepository } from './promo-codes.repository';
import { PromoCodesService } from './promo-codes.service';

@Module({
  controllers: [PromoCodesController],
  providers: [PromoCodesRepository, PromoCodesService],
})
export class PromoCodesModule {}
