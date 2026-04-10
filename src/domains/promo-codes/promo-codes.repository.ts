import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database';
import { Prisma, type Activation, type PromoCode } from '@generated/prisma/client';

@Injectable()
export class PromoCodesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPromoCode(data: Prisma.PromoCodeCreateInput): Promise<PromoCode> {
    return this.databaseService.promoCode.create({
      data: {
        activationLimit: data.activationLimit,
        code: data.code,
        discountPercent: data.discountPercent,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findPromoCodeByCode(code: string): Promise<PromoCode | null> {
    return this.databaseService.promoCode.findUnique({
      where: { code },
    });
  }

  async findPromoCodeById(id: string): Promise<PromoCode | null> {
    return this.databaseService.promoCode.findUnique({
      where: { id },
    });
  }

  async findAllPromoCodes(): Promise<PromoCode[]> {
    return this.databaseService.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActivationByCodeAndEmail(code: string, email: string): Promise<Activation | null> {
    return this.databaseService.activation.findFirst({
      where: {
        email,
        promoCode: {
          code,
        },
      },
    });
  }

  async createActivation(
    data: Prisma.ActivationUncheckedCreateInput,
    activationLimit: number,
  ): Promise<Activation> {
    return this.databaseService.$transaction(async (tx) => {
      const { count } = await tx.promoCode.updateMany({
        data: {
          activationsCount: {
            increment: 1,
          },
        },
        where: {
          activationLimit,
          activationsCount: {
            lt: activationLimit,
          },
          id: data.promoCodeId,
        },
      });

      if (count === 0) {
        throw new ConflictException('Исчерпан лимит активаций промокода');
      }

      return tx.activation.create({
        data: {
          email: data.email,
          promoCodeId: data.promoCodeId,
        },
      });
    });
  }

  async updatePromoCode(id: string, data: Prisma.PromoCodeUpdateInput): Promise<PromoCode> {
    return this.databaseService.promoCode.update({
      where: { id },
      data: {
        activationLimit: data.activationLimit,
        code: data.code,
        discountPercent: data.discountPercent,
        expiresAt: data.expiresAt,
      },
    });
  }

  async deletePromoCode(id: string): Promise<PromoCode> {
    return this.databaseService.promoCode.delete({ where: { id } });
  }
}
