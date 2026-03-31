// partService.ts
import { PrismaClient, Prisma, PartMaster } from '@prisma/client';
import { generateSku } from './skuGenerator';
import { CreatePartInput } from './types';

export class PartService {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreatePartInput) {
    const [primaryPhone, partType, quality] = await Promise.all([
      this.prisma.phone.findUniqueOrThrow({
        where: { id: input.primaryPhoneId },
        select: {
          generation: true,
          variantCode: true,
          variantName: true,
          model: {
            select: {
              code: true,
              name: true,
              brand: { select: { code: true, name: true } }
            }
          }
        }
      }),
      this.prisma.partType.findUniqueOrThrow({
        where: { id: input.partTypeId },
        select: {
          code: true,
          name: true,
          bucket: { select: { id: true } }
        }
      }),
      this.prisma.partQuality.findUniqueOrThrow({
        where: { id: input.qualityId },
        select: { code: true, name: true }
      })
    ]);

    if (!partType.bucket) {
      throw new Error(`PartType ${input.partTypeId} missing bucket`);
    }

    const skuData = generateSku({
      brandCode: primaryPhone.model.brand.code,
      modelCode: primaryPhone.model.code,
      generation: primaryPhone.generation,
      variantCode: primaryPhone.variantCode, // ✅ Always a string now
      bucketId: partType.bucket.id,
      partTypeCode: partType.code,
      qualityCode: quality.code
    });

    // ✅ Build search index INCLUDING the SKU for direct SKU searches
    const searchTerms = [
      primaryPhone.model.brand.name,
      primaryPhone.model.name,
      `s${primaryPhone.generation}`,
      primaryPhone.variantCode !== 'ZZ' ? primaryPhone.variantCode.toLowerCase() : null, // Exclude base sentinel from search
      primaryPhone.variantName?.toLowerCase(),
      partType.name,
      quality.name,
      skuData.sku // ✅ SKU included in searchIndex
    ].filter(Boolean) as string[];

    const searchIndex = [...new Set(searchTerms)]
      .map(t => t.toLowerCase())
      .join(' ');

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.partMaster.findUnique({
        where: { sku: skuData.sku },
        select: { id: true }
      });

      if (existing) {
        throw new Error(`SKU collision: ${skuData.sku}`);
      }

      const uniquePhoneIds = [...new Set(input.compatiblePhoneIds)];

      const part = await tx.partMaster.create({
        data: {
          sku: skuData.sku,
          searchIndex,
          partTypeId: input.partTypeId,
          qualityId: input.qualityId,
          primaryPhoneId: input.primaryPhoneId,
          supplier: input.supplier,
          cost: input.cost,
          price: input.price,
          stock: input.initialStock ?? 0,
          compatibilities: {
            create: uniquePhoneIds.map(phoneId => ({ phoneId }))
          }
        },
        include: {
          compatibilities: {
            include: {
              phone: {
                include: { model: { include: { brand: true } } }
              }
            }
          }
        }
      });

      return part;
    }, { isolationLevel: 'Serializable' });
  }

  // ✅ Enhanced search with trigram + ILIKE + full-text fallback (safe tagged template)
  async search(query: string, phoneId?: string, limit = 20) {
    const normalizedQuery = query.toLowerCase().trim();
    const ilikePattern = `%${normalizedQuery}%`;

    const phoneJoin = phoneId
      ? Prisma.sql`JOIN "PhoneCompatibility" pc ON pc."partId" = pm.id AND pc."phoneId" = ${phoneId}`
      : Prisma.empty;

    const results = await this.prisma.$queryRaw<(PartMaster & { sml: number })[]>`
      SELECT pm.*,
        GREATEST(
          similarity(pm."searchIndex", ${normalizedQuery}),
          CASE WHEN pm."searchIndex" ILIKE ${ilikePattern} THEN 0.5 ELSE 0 END,
          CASE WHEN to_tsvector('english', pm."searchIndex") @@ plainto_tsquery('english', ${normalizedQuery}) THEN 0.4 ELSE 0 END
        ) as sml
      FROM "PartMaster" pm
      ${phoneJoin}
      WHERE pm."searchIndex" % ${normalizedQuery}
         OR pm."searchIndex" ILIKE ${ilikePattern}
         OR to_tsvector('english', pm."searchIndex") @@ plainto_tsquery('english', ${normalizedQuery})
      ORDER BY sml DESC, pm.stock DESC
      LIMIT ${limit}
    `;

    return results;
  }

  async findForPhone(phoneId: string, partTypeId?: string) {
    return this.prisma.partMaster.findMany({
      where: {
        compatibilities: { some: { phoneId } },
        ...(partTypeId && { partTypeId })
      },
      include: {
        partType: true,
        quality: true,
        compatibilities: {
          include: { phone: { include: { model: { include: { brand: true } } } } }
        }
      },
      orderBy: [{ stock: 'desc' }, { price: 'asc' }]
    });
  }

  async resolveSupplierSku(supplier: string, supplierSku: string) {
    const alias = await this.prisma.partAlias.findUnique({
      where: { supplier_supplierSku: { supplier, supplierSku } },
      include: { part: true }
    });
    return alias?.part ?? null;
  }

  // ✅ Uses Prisma tagged template for safe parameterized query
  async adjustStock(partId: string, change: number, reason: string, reference?: string) {
    const result = await this.prisma.$queryRaw<{ adjust_stock: number }[]>`
      SELECT adjust_stock(
        ${partId}::uuid,
        ${change},
        ${reason},
        ${reference ?? null}
      )
    `;
    return result[0]?.adjust_stock;
  }

  async getStockHistory(partId: string, limit = 50) {
    return this.prisma.stockLedger.findMany({
      where: { partId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
