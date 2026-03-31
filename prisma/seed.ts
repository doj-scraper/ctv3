// prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { generateSku } from './skuGenerator';

const connectionString = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or DATABASE_URL_DIRECT is required');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  try {
    console.log('Clearing existing seed data...');
    await prisma.stockLedger.deleteMany();
    await prisma.partAlias.deleteMany();
    await prisma.phoneCompatibility.deleteMany();
    await prisma.partMaster.deleteMany();
    await prisma.partQuality.deleteMany();
    await prisma.partType.deleteMany();
    await prisma.bucket.deleteMany();
    await prisma.phone.deleteMany();
    await prisma.model.deleteMany();
    await prisma.brand.deleteMany();
    console.log('✅ Existing seed data cleared');

    // ─────────────────────────────────────────────
    // 1. BRANDS
    // ─────────────────────────────────────────────
    const apple = await prisma.brand.create({
      data: { code: 'AI', name: 'Apple' }
    });

    const samsung = await prisma.brand.create({
      data: { code: 'SA', name: 'Samsung' }
    });

    console.log('✅ Brands created');

    // ─────────────────────────────────────────────
    // 2. MODELS
    // ─────────────────────────────────────────────
    const iphone = await prisma.model.create({
      data: { code: 'IP', name: 'iPhone', brandId: apple.id }
    });

    const galaxy = await prisma.model.create({
      data: { code: 'GS', name: 'Galaxy S', brandId: samsung.id }
    });

    const galaxyA = await prisma.model.create({
      data: { code: 'GA', name: 'Galaxy A', brandId: samsung.id }
    });

    console.log('✅ Models created');

    // ─────────────────────────────────────────────
    // 3. PHONES
    // ─────────────────────────────────────────────
    const phoneData = [
      // iPhone 14 series
      { modelId: iphone.id, generation: '14', variantCode: 'ZZ', variantName: null },
      { modelId: iphone.id, generation: '14', variantCode: 'PL', variantName: 'Plus' },
      { modelId: iphone.id, generation: '14', variantCode: 'PR', variantName: 'Pro' },
      { modelId: iphone.id, generation: '14', variantCode: 'PM', variantName: 'Pro Max' },

      // iPhone 15 series
      { modelId: iphone.id, generation: '15', variantCode: 'ZZ', variantName: null },
      { modelId: iphone.id, generation: '15', variantCode: 'PL', variantName: 'Plus' },
      { modelId: iphone.id, generation: '15', variantCode: 'PR', variantName: 'Pro' },
      { modelId: iphone.id, generation: '15', variantCode: 'PM', variantName: 'Pro Max' },

      // iPhone 16 series
      { modelId: iphone.id, generation: '16', variantCode: 'ZZ', variantName: null },
      { modelId: iphone.id, generation: '16', variantCode: 'PL', variantName: 'Plus' },
      { modelId: iphone.id, generation: '16', variantCode: 'PR', variantName: 'Pro' },
      { modelId: iphone.id, generation: '16', variantCode: 'PM', variantName: 'Pro Max' },

      // Galaxy S23 series
      { modelId: galaxy.id, generation: '23', variantCode: 'ZZ', variantName: null },
      { modelId: galaxy.id, generation: '23', variantCode: 'PL', variantName: 'Plus' },
      { modelId: galaxy.id, generation: '23', variantCode: 'UL', variantName: 'Ultra' },
      { modelId: galaxy.id, generation: '23', variantCode: 'FE', variantName: 'FE' },

      // Galaxy S24 series
      { modelId: galaxy.id, generation: '24', variantCode: 'ZZ', variantName: null },
      { modelId: galaxy.id, generation: '24', variantCode: 'PL', variantName: 'Plus' },
      { modelId: galaxy.id, generation: '24', variantCode: 'UL', variantName: 'Ultra' },
      { modelId: galaxy.id, generation: '24', variantCode: 'FE', variantName: 'FE' },

      // Galaxy A series
      { modelId: galaxyA.id, generation: '54', variantCode: 'ZZ', variantName: null },
      { modelId: galaxyA.id, generation: '55', variantCode: 'ZZ', variantName: null },
    ];

    const phones: Record<string, string> = {}; // key → id lookup

    for (const p of phoneData) {
      const phone = await prisma.phone.create({ data: p });
      const key = `${p.modelId === iphone.id ? 'IP' : p.modelId === galaxy.id ? 'GS' : 'GA'}-${p.generation}-${p.variantCode}`;
      phones[key] = phone.id;
    }

    console.log(`✅ ${phoneData.length} Phones created`);

    // ─────────────────────────────────────────────
    // 4. BUCKETS
    // ─────────────────────────────────────────────
    const bucket1 = await prisma.bucket.create({ data: { id: 1, name: 'Visual Interface' } });
    const bucket2 = await prisma.bucket.create({ data: { id: 2, name: 'Chassis & Enclosure' } });
    const bucket3 = await prisma.bucket.create({ data: { id: 3, name: 'Functional Modules' } });
    const bucket4 = await prisma.bucket.create({ data: { id: 4, name: 'Interconnects' } });

    console.log('✅ Buckets created');

    // ─────────────────────────────────────────────
    // 5. PART TYPES
    // ─────────────────────────────────────────────
    const partTypes: Record<string, { id: string; code: string; bucketId: number }> = {};

    const partTypeData = [
      // Bucket 1: Visual Interface
      { code: 'A', name: 'Screen',    bucketId: bucket1.id },
      { code: 'B', name: 'Display',   bucketId: bucket1.id },
      { code: 'C', name: 'Digitizer', bucketId: bucket1.id },

      // Bucket 2: Chassis & Enclosure
      { code: 'A', name: 'Back Glass', bucketId: bucket2.id },
      { code: 'B', name: 'Frame',      bucketId: bucket2.id },
      { code: 'C', name: 'Housing',    bucketId: bucket2.id },

      // Bucket 3: Functional Modules (examples)
      { code: 'A', name: 'Battery',    bucketId: bucket3.id },
      { code: 'B', name: 'Camera',     bucketId: bucket3.id },

      // Bucket 4: Interconnects (examples)
      { code: 'A', name: 'Charge Port', bucketId: bucket4.id },
      { code: 'B', name: 'Flex Cable',  bucketId: bucket4.id },
    ];

    for (const pt of partTypeData) {
      const created = await prisma.partType.create({ data: pt });
      const key = `${pt.bucketId}${pt.code}`; // e.g. "1A" = Screen, "2C" = Housing
      partTypes[key] = { id: created.id, code: pt.code, bucketId: pt.bucketId };
    }

    console.log('✅ Part types created');

    // ─────────────────────────────────────────────
    // 6. PART QUALITIES
    // ─────────────────────────────────────────────
    const qualityOr = await prisma.partQuality.create({
      data: { code: 'OR', name: 'Original' }
    });

    const qualityRf = await prisma.partQuality.create({
      data: { code: 'RF', name: 'Refurbished' }
    });

    const qualityOem = await prisma.partQuality.create({
      data: { code: 'OE', name: 'OEM' }
    });

    console.log('✅ Part qualities created');

    // ─────────────────────────────────────────────
    // 7. PARTS (with search index & compatibilities)
    // ─────────────────────────────────────────────
    const partsToCreate = [
      // ── iPhone 15 Pro Screen (Original) ──
      {
        brandCode: 'AI', modelCode: 'IP', generation: '15', variantCode: 'PR',
        partTypeKey: '1A',
        quality: qualityOr,
        primaryPhoneKey: 'IP-15-PR',
        compatibleKeys: ['IP-15-PR'],
        supplier: 'MobileStar',
        cost: 85.00, price: 149.99, initialStock: 25,
      },
      {
        brandCode: 'AI', modelCode: 'IP', generation: '15', variantCode: 'PR',
        partTypeKey: '1A',
        quality: qualityRf,
        primaryPhoneKey: 'IP-15-PR',
        compatibleKeys: ['IP-15-PR'],
        supplier: 'MobileStar',
        cost: 45.00, price: 89.99, initialStock: 40,
      },
      {
        brandCode: 'AI', modelCode: 'IP', generation: '15', variantCode: 'PM',
        partTypeKey: '2A',
        quality: qualityOem,
        primaryPhoneKey: 'IP-15-PM',
        compatibleKeys: ['IP-15-PM'],
        supplier: 'PartsDirect',
        cost: 22.00, price: 44.99, initialStock: 60,
      },
      {
        brandCode: 'AI', modelCode: 'IP', generation: '14', variantCode: 'ZZ',
        partTypeKey: '3A',
        quality: qualityOr,
        primaryPhoneKey: 'IP-14-ZZ',
        compatibleKeys: ['IP-14-ZZ', 'IP-14-PL'],
        supplier: 'CellParts Inc',
        cost: 18.00, price: 34.99, initialStock: 100,
      },
      {
        brandCode: 'AI', modelCode: 'IP', generation: '16', variantCode: 'ZZ',
        partTypeKey: '4A',
        quality: qualityRf,
        primaryPhoneKey: 'IP-16-ZZ',
        compatibleKeys: ['IP-16-ZZ', 'IP-16-PL'],
        supplier: null,
        cost: 8.00, price: 19.99, initialStock: 75,
      },
      {
        brandCode: 'SA', modelCode: 'GS', generation: '24', variantCode: 'UL',
        partTypeKey: '1A',
        quality: qualityOr,
        primaryPhoneKey: 'GS-24-UL',
        compatibleKeys: ['GS-24-UL'],
        supplier: 'MobileStar',
        cost: 110.00, price: 199.99, initialStock: 15,
      },
      {
        brandCode: 'SA', modelCode: 'GS', generation: '24', variantCode: 'UL',
        partTypeKey: '1A',
        quality: qualityRf,
        primaryPhoneKey: 'GS-24-UL',
        compatibleKeys: ['GS-24-UL'],
        supplier: 'MobileStar',
        cost: 55.00, price: 109.99, initialStock: 30,
      },
      {
        brandCode: 'SA', modelCode: 'GS', generation: '23', variantCode: 'ZZ',
        partTypeKey: '2C',
        quality: qualityOem,
        primaryPhoneKey: 'GS-23-ZZ',
        compatibleKeys: ['GS-23-ZZ', 'GS-23-FE'],
        supplier: 'PartsDirect',
        cost: 30.00, price: 59.99, initialStock: 20,
      },
      {
        brandCode: 'SA', modelCode: 'GS', generation: '24', variantCode: 'ZZ',
        partTypeKey: '2B',
        quality: qualityOr,
        primaryPhoneKey: 'GS-24-ZZ',
        compatibleKeys: ['GS-24-ZZ', 'GS-24-PL'],
        supplier: 'CellParts Inc',
        cost: 25.00, price: 49.99, initialStock: 35,
      },
      {
        brandCode: 'SA', modelCode: 'GA', generation: '54', variantCode: 'ZZ',
        partTypeKey: '3B',
        quality: qualityRf,
        primaryPhoneKey: 'GA-54-ZZ',
        compatibleKeys: ['GA-54-ZZ'],
        supplier: null,
        cost: 15.00, price: 29.99, initialStock: 50,
      },
      {
        brandCode: 'SA', modelCode: 'GA', generation: '55', variantCode: 'ZZ',
        partTypeKey: '4B',
        quality: qualityOem,
        primaryPhoneKey: 'GA-55-ZZ',
        compatibleKeys: ['GA-55-ZZ'],
        supplier: 'CellParts Inc',
        cost: 5.00, price: 12.99, initialStock: 0,
      },
    ];

    const modelLookup: Record<string, { brandName: string; modelName: string }> = {
      'AI-IP': { brandName: 'apple', modelName: 'iphone' },
      'SA-GS': { brandName: 'samsung', modelName: 'galaxy s' },
      'SA-GA': { brandName: 'samsung', modelName: 'galaxy a' },
    };

    const partTypeLookup: Record<string, string> = {
      '1A': 'screen', '1B': 'display', '1C': 'digitizer',
      '2A': 'back glass', '2B': 'frame', '2C': 'housing',
      '3A': 'battery', '3B': 'camera',
      '4A': 'charge port', '4B': 'flex cable',
    };

    const createdParts: { sku: string; id: string }[] = [];

    for (const p of partsToCreate) {
      const pt = partTypes[p.partTypeKey];
      const skuData = generateSku({
        brandCode: p.brandCode,
        modelCode: p.modelCode,
        generation: p.generation,
        variantCode: p.variantCode,
        bucketId: pt.bucketId,
        partTypeCode: pt.code,
        qualityCode: p.quality.code,
      });

      const modelKey = `${p.brandCode}-${p.modelCode}`;
      const model = modelLookup[modelKey];
      const variantName = phoneData.find(
        ph => ph.generation === p.generation && ph.variantCode === p.variantCode
      )?.variantName;

      const searchTerms = [
        model.brandName,
        model.modelName,
        `s${p.generation}`,
        p.variantCode !== 'ZZ' ? p.variantCode.toLowerCase() : null,
        variantName?.toLowerCase(),
        partTypeLookup[p.partTypeKey],
        p.quality.name.toLowerCase(),
        skuData.sku.toLowerCase(),
      ].filter(Boolean) as string[];

      const searchIndex = [...new Set(searchTerms)].join(' ');

      const part = await prisma.partMaster.create({
        data: {
          sku: skuData.sku,
          searchIndex,
          partTypeId: pt.id,
          qualityId: p.quality.id,
          primaryPhoneId: phones[p.primaryPhoneKey],
          supplier: p.supplier,
          cost: p.cost,
          price: p.price,
          stock: p.initialStock,
          compatibilities: {
            create: [...new Set(p.compatibleKeys)].map(key => ({
              phoneId: phones[key]
            }))
          }
        }
      });

      createdParts.push({ sku: skuData.sku, id: part.id });
    }

    console.log(`✅ ${createdParts.length} Parts created`);

    // ─────────────────────────────────────────────
    // 8. PART ALIASES
    // ─────────────────────────────────────────────
    const aliasData = [
      { sku: createdParts[0].sku, supplier: 'MobileStar',    supplierSku: 'MS-IP15P-SCR-OG',  supplierName: 'iPhone 15 Pro Screen Original' },
      { sku: createdParts[1].sku, supplier: 'MobileStar',    supplierSku: 'MS-IP15P-SCR-RF',  supplierName: 'iPhone 15 Pro Screen Refurb' },
      { sku: createdParts[5].sku, supplier: 'MobileStar',    supplierSku: 'MS-S24U-SCR-OG',   supplierName: 'Galaxy S24 Ultra Screen OG' },
      { sku: createdParts[2].sku, supplier: 'PartsDirect',   supplierSku: 'PD-15PM-BG-OEM',   supplierName: 'iPhone 15 PM Back Glass' },
      { sku: createdParts[3].sku, supplier: 'CellParts Inc', supplierSku: 'CP-IP14-BAT-OR',   supplierName: 'iPhone 14 Battery Original' },
      { sku: createdParts[7].sku, supplier: 'PartsDirect',   supplierSku: 'PD-S23-HSG-OEM',   supplierName: 'Galaxy S23 Housing OEM' },
    ];

    for (const alias of aliasData) {
      const part = createdParts.find(p => p.sku === alias.sku);
      if (part) {
        await prisma.partAlias.create({
          data: {
            partId: part.id,
            supplier: alias.supplier,
            supplierSku: alias.supplierSku,
            supplierName: alias.supplierName,
          }
        });
      }
    }

    console.log(`✅ ${aliasData.length} Part aliases created`);

    // ─────────────────────────────────────────────
    // 9. STOCK LEDGER
    // ─────────────────────────────────────────────
    const ledgerEntries = createdParts
      .filter((_, i) => partsToCreate[i].initialStock > 0)
      .map((part, i) => ({
        partId: part.id,
        change: partsToCreate[i].initialStock,
        balance: partsToCreate[i].initialStock,
        reason: 'INITIAL_STOCK',
        reference: 'seed',
      }));

    for (const entry of ledgerEntries) {
      await prisma.stockLedger.create({ data: entry });
    }

    console.log(`✅ ${ledgerEntries.length} Stock ledger entries created`);

    console.log('\n✅ Seeding complete!\n');
  } catch (err) {
    console.error('❌ Seed execution failed:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main()
  .catch(() => {
    process.exit(1);
  });
