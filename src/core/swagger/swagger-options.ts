import { DocumentBuilder } from '@nestjs/swagger';

export function createSwaggerOptions(title: string, description: string) {
  return new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion('1.0')
    .build();
}
