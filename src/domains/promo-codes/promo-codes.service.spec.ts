import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, type Activation, type PromoCode } from '@generated/prisma/client';
import { PromoCodesRepository } from './promo-codes.repository';
import { PromoCodesService } from './promo-codes.service';

function createPrismaKnownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  const error = new Error(`Prisma error: ${code}`) as Prisma.PrismaClientKnownRequestError;

  Object.setPrototypeOf(error, Prisma.PrismaClientKnownRequestError.prototype);

  return Object.assign(error, {
    clientVersion: 'test',
    code,
  });
}

describe('PromoCodesService', () => {
  let service: PromoCodesService;
  let repository: jest.Mocked<PromoCodesRepository>;

  let createActivationMock: jest.Mock;
  let createPromoCodeMock: jest.Mock;
  let deletePromoCodeMock: jest.Mock;
  let findActivationByCodeAndEmailMock: jest.Mock;
  let findAllPromoCodesMock: jest.Mock;
  let findPromoCodeByCodeMock: jest.Mock;
  let findPromoCodeByIdMock: jest.Mock;
  let updatePromoCodeMock: jest.Mock;

  const basePromoCode: PromoCode = {
    activationLimit: 5,
    activationsCount: 0,
    code: 'SPRING-2026',
    createdAt: new Date('2026-04-11T10:00:00.000Z'),
    discountPercent: 15,
    expiresAt: new Date('2026-12-31T23:59:59.000Z'),
    id: '7cfa0f92-5a14-4b8b-a5f0-8d56206c2c8d',
    updatedAt: new Date('2026-04-11T10:00:00.000Z'),
  };

  const baseActivation: Activation = {
    createdAt: new Date('2026-04-11T10:10:00.000Z'),
    email: 'user@example.com',
    id: '0a5c15a2-d349-4ec9-bf7d-1d7507d621e9',
    promoCodeId: basePromoCode.id,
  };

  beforeEach(() => {
    createActivationMock = jest.fn();
    createPromoCodeMock = jest.fn();
    deletePromoCodeMock = jest.fn();
    findActivationByCodeAndEmailMock = jest.fn();
    findAllPromoCodesMock = jest.fn();
    findPromoCodeByCodeMock = jest.fn();
    findPromoCodeByIdMock = jest.fn();
    updatePromoCodeMock = jest.fn();

    repository = {
      createActivation: createActivationMock,
      createPromoCode: createPromoCodeMock,
      deletePromoCode: deletePromoCodeMock,
      findActivationByCodeAndEmail: findActivationByCodeAndEmailMock,
      findAllPromoCodes: findAllPromoCodesMock,
      findPromoCodeByCode: findPromoCodeByCodeMock,
      findPromoCodeById: findPromoCodeByIdMock,
      updatePromoCode: updatePromoCodeMock,
    } as unknown as jest.Mocked<PromoCodesRepository>;

    service = new PromoCodesService(repository);
  });

  it('creates promo code with normalized code', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(null);
    createPromoCodeMock.mockResolvedValue(basePromoCode);

    const result = await service.createPromoCode({
      activationLimit: 5,
      code: ' spring-2026 ',
      discountPercent: 15,
      expiresAt: new Date('2026-12-31T23:59:59.000Z'),
    });

    expect(findPromoCodeByCodeMock).toHaveBeenCalledWith('SPRING-2026');
    expect(createPromoCodeMock).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'SPRING-2026' }),
    );
    expect(result).toBe(basePromoCode);
  });

  it('throws conflict when promo code already exists', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);

    await expect(
      service.createPromoCode({
        activationLimit: 5,
        code: 'spring-2026',
        discountPercent: 15,
        expiresAt: new Date('2026-12-31T23:59:59.000Z'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps repository unique conflict to conflict exception during create', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(null);
    createPromoCodeMock.mockRejectedValue(createPrismaKnownRequestError('P2002'));

    await expect(
      service.createPromoCode({
        activationLimit: 5,
        code: 'spring-2026',
        discountPercent: 15,
        expiresAt: new Date('2026-12-31T23:59:59.000Z'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws bad request when promo code expiration is in the past', async () => {
    await expect(
      service.createPromoCode({
        activationLimit: 5,
        code: 'spring-2026',
        discountPercent: 15,
        expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when promo code is missing during activation', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(null);

    await expect(
      service.activatePromoCode('missing-code', {
        email: 'user@example.com',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws conflict when promo code is expired during activation', async () => {
    findPromoCodeByCodeMock.mockResolvedValue({
      ...basePromoCode,
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
    });

    await expect(
      service.activatePromoCode('spring-2026', {
        email: 'user@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('activates promo code with normalized code and email', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);
    findActivationByCodeAndEmailMock.mockResolvedValue(null);
    createActivationMock.mockResolvedValue(baseActivation);

    const result = await service.activatePromoCode(' spring-2026 ', {
      email: ' User@Example.com ',
    });

    expect(findPromoCodeByCodeMock).toHaveBeenCalledWith('SPRING-2026');
    expect(findActivationByCodeAndEmailMock).toHaveBeenCalledWith(
      'SPRING-2026',
      'user@example.com',
    );
    expect(createActivationMock).toHaveBeenCalledWith(
      {
        email: 'user@example.com',
        promoCodeId: basePromoCode.id,
      },
      basePromoCode.activationLimit,
    );
    expect(result).toBe(baseActivation);
  });

  it('throws conflict when email already activated promo code', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);
    findActivationByCodeAndEmailMock.mockResolvedValue(baseActivation);

    await expect(
      service.activatePromoCode('spring-2026', {
        email: 'user@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps repository unique conflict to conflict exception during activation race', async () => {
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);
    findActivationByCodeAndEmailMock.mockResolvedValue(null);
    createActivationMock.mockRejectedValue(createPrismaKnownRequestError('P2002'));

    await expect(
      service.activatePromoCode('spring-2026', {
        email: 'user@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps repository record not found to not found exception during update race', async () => {
    findPromoCodeByIdMock.mockResolvedValue(basePromoCode);
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);
    updatePromoCodeMock.mockRejectedValue(createPrismaKnownRequestError('P2025'));

    await expect(
      service.updatePromoCode(basePromoCode.id, {
        code: 'spring-2026',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps repository foreign key conflict to conflict exception during delete', async () => {
    findPromoCodeByIdMock.mockResolvedValue(basePromoCode);
    deletePromoCodeMock.mockRejectedValue(createPrismaKnownRequestError('P2003'));

    await expect(service.deletePromoCode(basePromoCode.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('maps repository record not found to not found exception during delete race', async () => {
    findPromoCodeByIdMock.mockResolvedValue(basePromoCode);
    deletePromoCodeMock.mockRejectedValue(createPrismaKnownRequestError('P2025'));

    await expect(service.deletePromoCode(basePromoCode.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('allows updating promo code without conflicting with itself', async () => {
    findPromoCodeByIdMock.mockResolvedValue(basePromoCode);
    findPromoCodeByCodeMock.mockResolvedValue(basePromoCode);
    updatePromoCodeMock.mockResolvedValue(basePromoCode);

    const result = await service.updatePromoCode(basePromoCode.id, {
      code: 'spring-2026',
    });

    expect(findPromoCodeByCodeMock).toHaveBeenCalledWith('SPRING-2026');
    expect(updatePromoCodeMock).toHaveBeenCalledWith(
      basePromoCode.id,
      expect.objectContaining({ code: 'SPRING-2026' }),
    );
    expect(result).toBe(basePromoCode);
  });
});
