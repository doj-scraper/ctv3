// prisma/skuGenerator.ts

export interface SkuInput {
  brandCode: string;
  modelCode: string;
  generation: string;
  variantCode: string;
  bucketId: number;
  partTypeCode: string;
  qualityCode: string;
}

export function generateSku(input: SkuInput) {
  const {
    brandCode,
    modelCode,
    generation,
    variantCode,
    bucketId,
    partTypeCode,
    qualityCode
  } = input;

  // Format: BRAND-MODELGENVARIANT-BUCKETTYPE-QUALITY
  // Example: AI-IP15PR-1A-OR
  const sku = `${brandCode}-${modelCode}${generation}${variantCode}-${bucketId}${partTypeCode}-${qualityCode}`.toUpperCase();

  return { sku };
}
