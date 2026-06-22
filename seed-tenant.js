const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('🔄 Nettoyage chirurgical du stock van via SQL...');
  
  // Exécution d'une requête SQL directe pour bypasser le validateur Prisma
  const affectedRows = await prisma.$executeRawUnsafe(`
    UPDATE vendor_stocks 
    SET tenant_id = '0c51a134-6d94-4d59-b8ff-ba113177b54b' 
    WHERE tenant_id IS NULL;
  `);

  console.log(`✅ SQL exécuté avec succès ! ${affectedRows} ligne(s) mise(s) à jour.`);
}

clean()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());