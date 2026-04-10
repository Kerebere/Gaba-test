import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  throwIfPrismaForeignKeyConflict,
  throwIfPrismaRecordNotFound,
  throwIfPrismaUniqueConflict,
} from '@/shared/exceptions/prisma/prisma-conflict-exception.util';
import type { Activation, PromoCode } from '@generated/prisma/client';
import type { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
import type { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCodesRepository } from './promo-codes.repository';

@Injectable()
export class PromoCodesService {
  constructor(private readonly promoCodeRepository: PromoCodesRepository) {}

  async createPromoCode(dto: CreatePromoCodeDto): Promise<PromoCode> {
    if (dto.expiresAt <= new Date()) {
      throw new BadRequestException('Дата окончания действия промокода должна быть в будущем');
    }

    const normalizedCode = this.normalizeCode(dto.code);
    await this.ensurePromoCodeCodeIsUnique(normalizedCode);

    try {
      return await this.promoCodeRepository.createPromoCode({
        activationLimit: dto.activationLimit,
        code: normalizedCode,
        discountPercent: dto.discountPercent,
        expiresAt: dto.expiresAt,
      });
    } catch (error: unknown) {
      throwIfPrismaUniqueConflict(error, 'Промокод с таким кодом уже существует');
      throw error;
    }
  }

  async getPromoCodes(): Promise<PromoCode[]> {
    return this.promoCodeRepository.findAllPromoCodes();
  }

  async getPromoCodeById(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findPromoCodeById(id);

    if (!promoCode) {
      throw new NotFoundException('Промокод не найден');
    }

    return promoCode;
  }

  async updatePromoCode(id: string, dto: UpdatePromoCodeDto): Promise<PromoCode> {
    await this.getPromoCodeById(id);

    if (dto.expiresAt && dto.expiresAt <= new Date()) {
      throw new BadRequestException('Дата окончания действия промокода должна быть в будущем');
    }

    const normalizedCode = dto.code ? this.normalizeCode(dto.code) : undefined;

    if (normalizedCode) {
      await this.ensurePromoCodeCodeIsUnique(normalizedCode, id);
    }

    try {
      return await this.promoCodeRepository.updatePromoCode(id, {
        activationLimit: dto.activationLimit,
        code: normalizedCode,
        discountPercent: dto.discountPercent,
        expiresAt: dto.expiresAt,
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throwIfPrismaRecordNotFound(error, 'Промокод не найден');
      throwIfPrismaUniqueConflict(error, 'Промокод с таким кодом уже существует');
      throw error;
    }
  }

  async deletePromoCode(id: string): Promise<PromoCode> {
    await this.getPromoCodeById(id);

    try {
      return await this.promoCodeRepository.deletePromoCode(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throwIfPrismaRecordNotFound(error, 'Промокод не найден');
      throwIfPrismaForeignKeyConflict(
        error,
        'Невозможно удалить промокод, так как он связан с активациями',
      );
      throw error;
    }
  }

  async activatePromoCode(code: string, dto: ActivatePromoCodeDto): Promise<Activation> {
    const normalizedCode = this.normalizeCode(code);
    const normalizedEmail = this.normalizeEmail(dto.email);

    const promoCode = await this.promoCodeRepository.findPromoCodeByCode(normalizedCode);

    if (!promoCode) {
      throw new NotFoundException('Промокод не найден');
    }

    if (promoCode.expiresAt <= new Date()) {
      throw new ConflictException('Срок действия промокода истек');
    }

    const existingActivation = await this.promoCodeRepository.findActivationByCodeAndEmail(
      normalizedCode,
      normalizedEmail,
    );

    if (existingActivation) {
      throw new ConflictException('Этот email уже активировал данный промокод');
    }

    try {
      return await this.promoCodeRepository.createActivation(
        {
          email: normalizedEmail,
          promoCodeId: promoCode.id,
        },
        promoCode.activationLimit,
      );
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throwIfPrismaUniqueConflict(error, 'Этот email уже активировал данный промокод');
      throw error;
    }
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async ensurePromoCodeCodeIsUnique(
    code: string,
    currentPromoCodeId?: string,
  ): Promise<void> {
    const existingPromoCode = await this.promoCodeRepository.findPromoCodeByCode(code);

    if (existingPromoCode && existingPromoCode.id !== currentPromoCodeId) {
      throw new ConflictException('Промокод с таким кодом уже существует');
    }
  }
}
