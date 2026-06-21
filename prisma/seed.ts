import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// 🎯 Injection directe pour forcer Prisma à s'authentifier correctement au pooler de ton projet ritqiabrmetafusfghdc
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ritqiabrmetafusfghdc:Welcome2026Crmsfa@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require",
    },
  },
});

async function main() {
  console.log('🌱 [Seed] Initialisation du jeu de données Multi-Tenant...');

  // 🎯 SÉCURITÉ POOLER : Pas de deleteMany global pour éviter le blocage de PgBouncer

  // 1. Création du premier Tenant (Entreprise Cliente)
  const tenant = await prisma.tenant.create({
    data: {
      companyName: "Fan Milk Côte d'Ivoire",
      industry: 'FMCG_FROZEN',
    },
  });
  console.log(`🏢 Tenant créé : ${tenant.companyName} (${tenant.id})`);

  // 2. Création du Secteur / Territoire de référence
  const territory = await prisma.territory.create({
    data: {
      tenantId: tenant.id,
      code: 'CIV-ABJ-MARCORY',
      name: 'Marcory Zone 4',
      level: 'SECTEUR',
    },
  });

  // 3. Création d'un utilisateur Superviseur
  const hashedPassword = await bcrypt.hash('Salesconnected2026!', 10);
  const manager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'superviseur.abidjan@fanmilk.ci',
      password: hashedPassword,
      firstName: 'Ange',
      lastName: 'Touré',
      role: 'MANAGER',
      phone: '+2250700000000',
      matricule: 'FM-2026-001',
      status: 'ACTIVE',
    },
  });
  console.log(`👤 Utilisateur Manager créé : ${manager.email}`);

  // 4. Création de la hiérarchie de distribution (Grossiste -> Ambulant)
  const grossisteKD = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      code: 'KD-ALIBABA-01',
      name: 'Dépôt Grossiste Ali Baba',
      channel: 'KEY_DISTRIBUTOR',
      status: 'VALIDATED',
      lat: 5.316667,
      lng: -3.983333,
      territoryId: territory.id,
    },
  });

  await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      code: 'OUT-CHARLIE-04',
      name: 'Pousse-Pousse Charlie 04',
      channel: 'AMBULANT',
      status: 'VALIDATED',
      lat: 5.318000,
      lng: -3.985000,
      territoryId: territory.id,
      parentId: grossisteKD.id,
    },
  });
  console.log('🏪 Hiérarchie commerciale (Grossiste -> Vendeur Ambulant) injectée.');

  // 5. Création d'un produit avec conversion d'unité stricte
  const category = await prisma.productCategory.create({
    data: { tenantId: tenant.id, name: 'GLACES' },
  });
  const subCat = await prisma.productSubCategory.create({
    data: { categoryId: category.id, name: 'BATONNETS' },
  });
  const brand = await prisma.productBrand.create({
    data: { subProductCategoryId: subCat.id, name: 'STAR' },
  });
  const format = await prisma.productPackFormat.create({
    data: { brandId: brand.id, name: '150ML' },
  });

  const skuStar = await prisma.sKU.create({
    data: {
      tenantId: tenant.id,
      name: 'STAR 150 ml VANILLE',
      ean: '6131234567890',
      code: 'SKU-STAR-VAN',
      packFormatId: format.id,
      priceHt: 84.0,
      baseUnit: 'SACHET',
    },
  });

  await prisma.productPackaging.create({
    data: {
      skuId: skuStar.id,
      name: 'CARTON',
      conversionFactor: 100,
    },
  });
  console.log('📦 Catalogue SKU connecté avec règles de conversion d\'unités.');

  console.log('\n✨ [Seed Terminé] Ta base multi-tenant est prête pour le développement !');
  console.log(`\n💡 NOTE POUR TES FUTURS TESTS : Utilise le header HTTP suivant :`);
  console.log(`   X-Tenant-ID : ${tenant.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });