import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setupSwagger } from './core/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const isSwaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', false);

  if (isSwaggerEnabled) {
    setupSwagger(app, 'Promo test API main', 'API for promo test');
  }

  await app.listen(port);
  Logger.log(`Application is running on port ${port}`);
}

void bootstrap();
