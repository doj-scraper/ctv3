import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type FacetOption = {
  value: string;
  label: string;
  count: number;
};

function buildDeviceLabel(phone: {
  generation: string;
  variantName: string | null;
  model: {
    name: string;
    brand: { name: string };
  };
}) {
  return [phone.model.brand.name, phone.model.name, phone.generation, phone.variantName]
    .filter(Boolean)
    .join(' ');
}

function centsFromDecimal(value: { toString(): string } | number | null) {
  if (!value) {
    return 0;
  }

  return Math.round(Number(value) * 100);
}

function sortFacetOptions(options: FacetOption[]) {
  return options.sort((left, right) => left.label.localeCompare(right.label));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';
  const brand = searchParams.get('brand')?.trim() ?? '';
  const model = searchParams.get('model')?.trim() ?? '';
  const quality = searchParams.get('quality')?.trim() ?? '';
  const bucket = searchParams.get('bucket')?.trim() ?? '';

  const whereClauses: any[] = [];

  for (const term of search.toLowerCase().split(/\s+/).filter(Boolean)) {
    whereClauses.push({
      searchIndex: {
        contains: term,
        mode: 'insensitive',
      },
    });
  }

  if (brand) {
    whereClauses.push({
      primaryPhone: {
        model: {
          brand: {
            name: {
              equals: brand,
              mode: 'insensitive',
            },
          },
        },
      },
    });
  }

  if (model) {
    whereClauses.push({
      primaryPhone: {
        model: {
          name: {
            equals: model,
            mode: 'insensitive',
          },
        },
      },
    });
  }

  if (quality) {
    whereClauses.push({
      quality: {
        name: {
          equals: quality,
          mode: 'insensitive',
        },
      },
    });
  }

  if (bucket) {
    whereClauses.push({
      partType: {
        bucket: {
          name: {
            equals: bucket,
            mode: 'insensitive',
          },
        },
      },
    });
  }

  const where = whereClauses.length > 0 ? { AND: whereClauses } : {};

  try {
    const [parts, facetSource] = await Promise.all([
      prisma.partMaster.findMany({
        where,
        orderBy: [{ stock: 'desc' }, { updatedAt: 'desc' }],
        include: {
          quality: true,
          partType: {
            include: {
              bucket: true,
            },
          },
          primaryPhone: {
            include: {
              model: {
                include: {
                  brand: true,
                },
              },
            },
          },
          compatibilities: {
            include: {
              phone: {
                include: {
                  model: {
                    include: {
                      brand: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              phone: {
                generation: 'asc',
              },
            },
          },
        },
      }),
      prisma.partMaster.findMany({
        select: {
          quality: {
            select: {
              name: true,
            },
          },
          partType: {
            select: {
              bucket: {
                select: {
                  name: true,
                },
              },
            },
          },
          primaryPhone: {
            select: {
              model: {
                select: {
                  name: true,
                  brand: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const brandCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();
    const qualityCounts = new Map<string, number>();
    const bucketCounts = new Map<string, number>();

    for (const part of facetSource) {
      const brandName = part.primaryPhone.model.brand.name;
      const modelName = part.primaryPhone.model.name;
      const qualityName = part.quality.name;
      const bucketName = part.partType.bucket.name;

      brandCounts.set(brandName, (brandCounts.get(brandName) ?? 0) + 1);
      modelCounts.set(modelName, (modelCounts.get(modelName) ?? 0) + 1);
      qualityCounts.set(qualityName, (qualityCounts.get(qualityName) ?? 0) + 1);
      bucketCounts.set(bucketName, (bucketCounts.get(bucketName) ?? 0) + 1);
    }

    const filters = {
      brands: sortFacetOptions(
        [...brandCounts.entries()].map(([value, count]) => ({ value, label: value, count }))
      ),
      models: sortFacetOptions(
        [...modelCounts.entries()].map(([value, count]) => ({ value, label: value, count }))
      ),
      qualities: sortFacetOptions(
        [...qualityCounts.entries()].map(([value, count]) => ({ value, label: value, count }))
      ),
      buckets: sortFacetOptions(
        [...bucketCounts.entries()].map(([value, count]) => ({ value, label: value, count }))
      ),
    };

    const payload = parts.map((part) => {
      const primaryDeviceLabel = buildDeviceLabel(part.primaryPhone);

      return {
        id: part.id,
        sku: part.sku,
        searchIndex: part.searchIndex,
        supplier: part.supplier,
        stock: part.stock,
        price: centsFromDecimal(part.price),
        cost: centsFromDecimal(part.cost),
        name: `${part.partType.name} for ${primaryDeviceLabel}`,
        brand: part.primaryPhone.model.brand.name,
        model: part.primaryPhone.model.name,
        bucket: part.partType.bucket.name,
        primaryDeviceLabel,
        quality: {
          id: part.quality.id,
          code: part.quality.code,
          name: part.quality.name,
        },
        partType: {
          id: part.partType.id,
          code: part.partType.code,
          name: part.partType.name,
          bucket: {
            id: part.partType.bucket.id,
            name: part.partType.bucket.name,
          },
        },
        primaryPhone: {
          id: part.primaryPhone.id,
          generation: part.primaryPhone.generation,
          variantCode: part.primaryPhone.variantCode,
          variantName: part.primaryPhone.variantName,
          model: {
            id: part.primaryPhone.model.id,
            code: part.primaryPhone.model.code,
            name: part.primaryPhone.model.name,
            brand: {
              id: part.primaryPhone.model.brand.id,
              code: part.primaryPhone.model.brand.code,
              name: part.primaryPhone.model.brand.name,
            },
          },
        },
        compatibilities: part.compatibilities.map((compatibility) => ({
          id: compatibility.id,
          phone: {
            id: compatibility.phone.id,
            generation: compatibility.phone.generation,
            variantCode: compatibility.phone.variantCode,
            variantName: compatibility.phone.variantName,
            label: buildDeviceLabel(compatibility.phone),
            model: {
              id: compatibility.phone.model.id,
              code: compatibility.phone.model.code,
              name: compatibility.phone.model.name,
              brand: {
                id: compatibility.phone.model.brand.id,
                code: compatibility.phone.model.brand.code,
                name: compatibility.phone.model.brand.name,
              },
            },
          },
        })),
      };
    });

    return NextResponse.json({
      success: true,
      total: payload.length,
      filters,
      parts: payload,
    });
  } catch (error) {
    console.error('Error fetching parts:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch parts',
      },
      { status: 500 }
    );
  }
}
