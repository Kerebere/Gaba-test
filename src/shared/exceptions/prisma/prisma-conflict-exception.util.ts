import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';

export function throwIfPrismaUniqueConflict(error: unknown, message: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException(message);
  }
}

export function throwIfPrismaForeignKeyConflict(error: unknown, message: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
    throw new ConflictException(message);
  }
}

export function throwIfPrismaRecordNotFound(error: unknown, message: string): void {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    throw new NotFoundException(message);
  }
}
