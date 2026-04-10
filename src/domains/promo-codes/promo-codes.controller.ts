import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Activation, PromoCode } from '@generated/prisma/client';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ActivatePromoCodeDto } from './dto/activate-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodeService: PromoCodesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание промокода' })
  @ApiCreatedResponse({ description: 'Промокод успешно создан' })
  @ApiConflictResponse({ description: 'Такой промокод уже существует' })
  async createPromoCode(@Body() dto: CreatePromoCodeDto): Promise<PromoCode> {
    return this.promoCodeService.createPromoCode(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка промокодов' })
  @ApiOkResponse({ description: 'Список промокодов получен' })
  async getPromoCodes(): Promise<PromoCode[]> {
    return this.promoCodeService.getPromoCodes();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение промокода по идентификатору' })
  @ApiParam({
    description: 'Идентификатор промокода',
    example: '7cfa0f92-5a14-4b8b-a5f0-8d56206c2c8d',
    name: 'id',
  })
  @ApiOkResponse({ description: 'Промокод успешно найден' })
  @ApiNotFoundResponse({ description: 'Промокод не найден' })
  async getPromoCodeById(@Param('id', new ParseUUIDPipe()) id: string): Promise<PromoCode> {
    return this.promoCodeService.getPromoCodeById(id);
  }

  @Post(':code/activations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Активация промокода по почте' })
  @ApiParam({
    description: 'Промокод',
    example: 'SPRING-2026',
    name: 'code',
  })
  @ApiCreatedResponse({ description: 'Промокод успешно активирован' })
  @ApiNotFoundResponse({ description: 'Промокод не найден' })
  @ApiConflictResponse({
    description: 'Промокод уже активирован/Истек срок действия промокода',
  })
  async activatePromoCode(
    @Param('code') code: string,
    @Body() dto: ActivatePromoCodeDto,
  ): Promise<Activation> {
    return this.promoCodeService.activatePromoCode(code, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление промокода по id' })
  @ApiOkResponse({ description: 'Промокод успешно обновлен' })
  @ApiParam({
    description: 'Идентификатор промокода',
    example: '7cfa0f92-5a14-4b8b-a5f0-8d56206c2c8d',
    name: 'id',
  })
  @ApiNotFoundResponse({ description: 'Промокод не найден' })
  async updatePromoCode(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePromoCodeDto,
  ): Promise<PromoCode> {
    return this.promoCodeService.updatePromoCode(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление промокода по id' })
  @ApiParam({
    description: 'Идентификатор промокода',
    example: '7cfa0f92-5a14-4b8b-a5f0-8d56206c2c8d',
    name: 'id',
  })
  @ApiOkResponse({ description: 'Промокод успешно удален' })
  @ApiNotFoundResponse({ description: 'Промокод не найден' })
  async deletePromoCode(@Param('id', new ParseUUIDPipe()) id: string): Promise<PromoCode> {
    return this.promoCodeService.deletePromoCode(id);
  }
}
