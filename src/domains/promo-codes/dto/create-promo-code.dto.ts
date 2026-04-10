import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({
    description: 'Уникальный промокод',
    example: 'SPRING-2026',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Процент скидки',
    example: 15,
    maximum: 100,
    minimum: 1,
  })
  @IsInt()
  @Max(100)
  @Min(1)
  @IsNotEmpty()
  @Type(() => Number)
  discountPercent: number;

  @ApiProperty({
    description: 'Максимальное количество использований промокода',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  @Type(() => Number)
  activationLimit: number;

  @ApiProperty({
    description: 'Дата истечения промокода',
    example: '2026-12-31T23:59:59.000Z',
    format: 'date-time',
  })
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;
}
