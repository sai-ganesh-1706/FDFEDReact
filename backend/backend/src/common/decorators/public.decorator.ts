import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marks the small set of endpoints that must be reachable before sign-in. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
