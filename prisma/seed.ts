import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du peuplement de la base de données multi-tenant...');

  // 1. Suppression des anciennes données (Ordre strict pour les clés étrangères)
  await prisma.visit.deleteMany();
  await prisma.outlet.deleteMany();
  await prisma.territory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.productPackFormat.deleteMany();
  await prisma.productBrand.deleteMany();
  await prisma.productSubCategory.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.tenant.deleteMany();

  // ==========================================
  // 🏢 2. CRÉATION DU TENANT (ENTREPRISE ANCRE)
  // ==========================================
  const tenant = await prisma.tenant.create({
    data: {
      companyName: 'Fan Milk Côte d\'Ivoire',
      industry: 'FMCG_FROZEN',
      isActive: true,
    },
  });
  console.log(`🏢 Tenant créé : ${tenant.companyName} (${tenant.id})`);

  // ==========================================
  // 👥 3. CRÉATION DES UTILISATEURS (AVEC RÔLES)
  // ==========================================
  const hashedPassword = await bcrypt.hash('Salesconnected2026', 10);

  // Compte Administrateur / Manager
  const manager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'manager.fanmilk@salesconnected.ci',
      password: hashedPassword,
      firstName: 'Ange Emmanuel',
      lastName: 'Offo',
      role: 'MANAGER',
      phone: '+2250707070707',
      matricule: 'FM-2026-MGR',
      status: 'ACTIVE',
    },
  });

  // Compte Commercial Terrain (REP) rattaché au manager
  const rep = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'sales.fanmilk@salesconnected.ci',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Koffi',
      role: 'REP',
      phone: '+2250505050505',
      matricule: 'FM-2026-REP',
      status: 'ACTIVE',
      managerId: manager.id, // Relation Manager/Vendor
    },
  });
  console.log('👥 Utilisateurs de test créés (Manager + Commercial Terrain).');

  // ==========================================
  // 🗺️ 4. CRÉATION DE LA STRUCTURATION GÉOGRAPHIQUE
  // ==========================================
  const territory = await prisma.territory.create({
    data: {
      tenantId: tenant.id,
      code: 'TER-ABJ-SUD',
      name: 'Zone Abidjan Sud (Marcory / Treichville)',
      level: 'SECTEUR',
      isActive: true,
    },
  });
  console.log(`🗺️ Territoire créé : ${territory.name}`);

  // ==========================================
  // 🏪 5. CRÉATION DES POINTS DE VENTE (OUTLETS)
  // ==========================================
  const outlet1 = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      territoryId: territory.id,
      code: 'PDV-MARC-001',
      name: 'Boutique Proxi Marcory',
      channel: 'RETAIL',
      lat: 5.316667,
      lng: -3.983333,
      status: 'APPROVED',
    },
  });

  const outlet2 = await prisma.outlet.create({
    data: {
      tenantId: tenant.id,
      territoryId: territory.id,
      code: 'PDV-TREICH-002',
      name: 'Grossiste Alimentaire Treichville',
      channel: 'KD',
      lat: 5.3022,
      lng: -4.0011,
      status: 'APPROVED',
    },
  });
  console.log('🏪 Points de vente (Outlets) rattachés au territoire et à l\'organisation créés.');

  // ==========================================
  // 📦 6. CRÉATION DU CATALOGUE PRODUITS (SKUS)
  // ==========================================
  const category = await prisma.productCategory.create({
    data: {
      tenantId: tenant.id,
      name: 'CREMES_GLACEES',
      displayName: 'Crèmes Glacées',
    },
  });

  const subCategory = await prisma.productSubCategory.create({
    data: {
      categoryId: category.id,
      name: 'BATONNETS',
      displayName: 'Bâtonnets Individuels',
    },
  });

  const brand = await prisma.productBrand.create({
    data: {
      subProductCategoryId: subCategory.id,
      name: 'FAN_CHOCO',
      displayName: 'Fan Choco',
    },
  });

  const packFormat = await prisma.productPackFormat.create({
    data: {
      brandId: brand.id,
      name: 'STANDARD_70ML',
      displayName: 'Format Standard 70ml',
    },
  });

  const sku = await prisma.sKU.create({
    data: {
      tenantId: tenant.id,
      packFormatId: packFormat.id,
      name: 'Fan Choco Classique 70ml',
      displayName: 'Fan Choco Classique',
      ean: '6151100022334',
      code: 'SKU-FC-70',
      priceHt: 150.0,
      vatRate: 18.0,
      baseUnit: 'UNIT',
      active: true,
    },
  });

  console.log(`📦 Catalogue Produits peuplé : ${sku.name} créé.`);
  console.log('\n🟢 Jeu de données Multi-Tenant injecté avec succès !');
  console.log(`\n🔑 Identifiants de connexion pour tes tests :`);
  console.log(`   👉 Tenant ID : ${tenant.id} (À mettre dans le header X-Tenant-ID)`);
  console.log(`   👉 Login Manager : manager.fanmilk@salesconnected.ci / Salesconnected2026`);
  console.log(`   👉 Login Commercial : sales.fanmilk@salesconnected.ci / Salesconnected2026`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'exécution du Seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });