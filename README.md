# Promo Codes API

REST API для системы промокодов на `NestJS`, `TypeScript`, `PostgreSQL` и `Prisma`.

Реализовано:

- создание промокода
- получение списка промокодов
- получение промокода по `id`
- обновление промокода
- удаление промокода
- активация промокода по `email`

## Стек

- `Node.js`
- `NestJS`
- `TypeScript`
- `PostgreSQL`
- `Prisma`
- `Jest`
- `ESLint`
- `Prettier`

## Требования

- `Node.js 20+`
- `Yarn 1.x`
- `Docker` и `Docker Compose` для локального PostgreSQL

## Переменные окружения

Создай файл `.env` в корне проекта:

```env
NODE_ENV=development
PORT=3000
SWAGGER_ENABLED=true
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/promo_db?schema=public"
```

## Установка и запуск

1. Установить зависимости:

```bash
yarn install
```

2. Поднять PostgreSQL:

```bash
yarn db:up
```

3. Сгенерировать Prisma schema и client:

```bash
yarn prisma:generate
```

4. Применить миграции:

```bash
yarn prisma:migrate:deploy
```

Если нужна локальная dev-миграция:

```bash
yarn prisma:migrate:dev
```

5. Запустить проект:

```bash
yarn start:dev
```

Приложение будет доступно по адресу:

```text
http://localhost:3000
```

Swagger, если `SWAGGER_ENABLED=true`:

```text
http://localhost:3000/api
```

## Полезные команды

```bash
yarn start:dev
yarn build
yarn start:prod
yarn lint
yarn lint:fix
yarn format
yarn format:check
yarn test --runInBand
yarn check
```

## Prisma

В проекте используется `prisma-multischema`:

- схемы лежат в `prisma/subschemas`
- итоговый `prisma/schema.prisma` генерируется командой `yarn prisma:generate`
- Prisma Client генерируется в `generated/prisma`

Основные файлы:

- `prisma/subschemas/promo-code/promo-code.prisma`
- `prisma/subschemas/activation/activation.prisma`
- `prisma/schema.prisma`

## Структура API

### Создать промокод

`POST /promo-codes`

Пример тела:

```json
{
  "code": "SPRING-2026",
  "discountPercent": 15,
  "activationLimit": 100,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

### Получить список промокодов

`GET /promo-codes`

### Получить промокод по id

`GET /promo-codes/:id`

### Обновить промокод

`PUT /promo-codes/:id`

Пример тела:

```json
{
  "discountPercent": 20,
  "activationLimit": 150
}
```

### Удалить промокод

`DELETE /promo-codes/:id`

### Активировать промокод

`POST /promo-codes/:code/activations`

Пример тела:

```json
{
  "email": "user@example.com"
}
```

## Проверка качества

Перед сдачей можно прогнать:

```bash
yarn format
yarn lint
yarn test --runInBand
yarn build
```
