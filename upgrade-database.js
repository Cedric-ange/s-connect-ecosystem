"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const supabasePool = new pg_1.Pool({
    connectionString: 'postgresql://postgres.begprdaocbyxfbzvavwb:Salesconnected2026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
});
async function upgradeDatabase() {
    console.log(`⚡ Connexion à Supabase pour la mise à niveau multi-tenant...`);
    const client = await supabasePool.connect();
    const tenantId = '0c51a134-6d94-4d59-b8ff-ba113177b54b';
    // 1. Essayer de créer le Tenant de manière isolée
    try {
        console.log(`🏢 Tentative de configuration du Tenant Fan Milk (ID: ${tenantId})...`);
        await client.query(`
      INSERT INTO "Tenant" (id, name, code, "createdAt", "updatedAt")
      VALUES ($1, 'Fan Milk Côte d''Ivoire', 'FANMILK', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `, [tenantId]);
        console.log(`✅ Tenant configuré.`);
    }
    catch (err) {
        console.log(`💡 Note: La table Tenant globale sera gérée directement via Prisma, continuation...`);
    }
    // 2. Ajouter la colonne tenant_id dans analytics.fanmilk_clean_history et tatouer les lignes
    try {
        console.log(`🔨 Ajout de la colonne tenant_id dans la table analytics...`);
        await client.query(`
      ALTER TABLE analytics.fanmilk_clean_history 
      ADD COLUMN IF NOT EXISTS tenant_id UUID;
    `);
        console.log(`🏷️ Tatouage des 7000 lignes existantes avec l'ID de Fan Milk...`);
        const updateRes = await client.query(`
      UPDATE analytics.fanmilk_clean_history 
      SET tenant_id = $1 
      WHERE tenant_id IS NULL;
    `, [tenantId]);
        console.log(`\n✅ Réussite ! ${updateRes.rowCount} lignes ont été associées à Fan Milk.`);
        console.log(`🚀 Ton architecture multi-tenant est opérationnelle sur les données réelles !`);
    }
    catch (error) {
        console.error(`❌ Échec de la mise à niveau de l'historique :`, error);
    }
    finally {
        client.release();
        await supabasePool.end();
    }
}
upgradeDatabase();
