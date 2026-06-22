"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// 🌐 Source : FieldPro Cloud SQL
const sourcePool = new pg_1.Pool({
    host: 'replica-pg-cloudsql.fieldproapp.com',
    port: 5432,
    database: 'civ__fanmilk_2',
    user: 'civ__fanmilk_2_readonly',
    password: 'EKCDdRXMlQsRNCe',
    ssl: { rejectUnauthorized: false },
});
// 💻 Destination : Ton PC
const localPool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'fieldpro_civ_mirror',
    user: 'postgres',
    password: '@ngeToure1201',
});
async function updateDatabase() {
    console.log('🔄 [Sync] Vérification des nouvelles données depuis FieldPro...');
    const sourceClient = await sourcePool.connect();
    const localClient = await localPool.connect();
    try {
        const tablesToUpdate = ['v2_transfo_ventes', 'v2_transfo_ventes_sku'];
        for (const table of tablesToUpdate) {
            // 1. Trouver la dernière date enregistrée en local
            const maxLocalRes = await localClient.query(`SELECT MAX(_updated_at) as last_update FROM "${table}";`);
            const lastUpdate = maxLocalRes.rows[0].last_update;
            if (!lastUpdate) {
                console.log(`⚠️ Table "${table}" vide en local. Lance d'abord le clone complet.`);
                continue;
            }
            console.log(`📋 [${table}] Dernière synchronisation locale : ${lastUpdate.toISOString()}`);
            // 2. Récupérer la structure des colonnes pour l'insertion
            const columnsRes = await localClient.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
            const columnsStr = columnsRes.rows.map((col) => `"${col.column_name}"`).join(', ');
            // 3. Récupérer uniquement les nouvelles lignes distantes
            const newRowsRes = await sourceClient.query(`
        SELECT * FROM "${table}" WHERE _updated_at > $1 ORDER BY _updated_at ASC;
      `, [lastUpdate]);
            const count = newRowsRes.rows.length;
            console.log(`📥 ${count} nouvelles lignes détectées sur le serveur pour "${table}".`);
            if (count > 0) {
                // 4. Insertion des nouveautés
                await localClient.query('BEGIN');
                for (const row of newRowsRes.rows) {
                    const values = columnsRes.rows.map((col) => row[col.column_name]);
                    const placeholders = columnsRes.rows.map((_, idx) => `$${idx + 1}`).join(', ');
                    // Évite les doublons en cas de mise à jour d'une même ligne
                    if (table === 'v2_transfo_ventes') {
                        await localClient.query(`DELETE FROM "${table}" WHERE submission_id = $1;`, [row.submission_id]);
                    }
                    await localClient.query(`INSERT INTO "${table}" (${columnsStr}) VALUES (${placeholders});`, values);
                }
                await localClient.query('COMMIT');
                console.log(`✅ ${count} lignes ajoutées avec succès dans "${table}".`);
            }
        }
        console.log('\n✨ [Sync] Ton clone local est parfaitement à jour avec le terrain !');
    }
    catch (error) {
        if (localClient)
            await localClient.query('ROLLBACK');
        console.error('❌ Erreur lors de la mise à jour :', error);
    }
    finally {
        sourceClient.release();
        localClient.release();
        await sourcePool.end();
        await localPool.end();
    }
}
updateDatabase();
