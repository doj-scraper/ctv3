// reindex.ts — Run when Brand/Model/PartType names change
import { PrismaClient } from '@prisma/client';

export async function reindexSearchIndex(prisma: PrismaClient) {
  const parts = await prisma.partMaster.findMany({
    include: {
      primaryPhone: {
        include: { model: { include: { brand: true } } }
      },
      partType: true,
      quality: true
    }
  });

  const updates = parts.map(part => {
    const searchTerms = [
      part.primaryPhone.model.brand.name,
      part.primaryPhone.model.name,
      `s${part.primaryPhone.generation}`,
      part.primaryPhone.variantCode !== 'ZZ' ? part.primaryPhone.variantCode.toLowerCase() : null,
      part.primaryPhone.variantName?.toLowerCase(),
      part.partType.name,
      part.quality.name,
      part.sku
    ].filter(Boolean) as string[];

    const searchIndex = [...new Set(searchTerms)]
      .map(t => t.toLowerCase())
      .join(' ');

    return prisma.partMaster.update({
      where: { id: part.id },
      data: { searchIndex }
    });
  });

  await prisma.$transaction(updates);
  console.log(`Reindexed ${updates.length} parts`);
}
