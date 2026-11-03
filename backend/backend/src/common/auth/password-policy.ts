import { BadRequestException } from '@nestjs/common';

export const MIN_PASSWORD_LENGTH = 8;
export const DEFAULT_INITIAL_PASSWORD = '12345678';

export function assertPasswordPolicy(password: string | undefined): void {
  if (password === undefined) return;
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password !== password.trim()) {
    throw new BadRequestException('Password cannot start or end with whitespace');
  }
}
