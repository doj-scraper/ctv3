// prisma/types.ts
import { Prisma } from '@prisma/client';

export interface CreatePartInput {
  primaryPhoneId: string;
  partTypeId: string;
  qualityId: string;
  compatiblePhoneIds: string[];
  supplier?: string | null;
  cost?: number | Prisma.Decimal | null;
  price?: number | Prisma.Decimal | null;
  initialStock?: number;
}
