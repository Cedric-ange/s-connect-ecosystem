import { Pool } from 'pg';

// 🔌 Connexion DIRECTE à la base de données (Port 5432, sans passer par le pooler PgBouncer)
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.begprdaocbyxfbzvavwb:Salesconnected2026@aws-1-eu-central-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function checkDatabaseState() {
  console.log('⚡ [Audit] Connexion DIRECTE à Supabase (Port 5432)...');
  let client;
  
  try {
    client = await supabasePool.connect();

    // 1. Vérifier si la table d'historique existe et son volume
    const historyRes = await client.query(`
      SELECT COUNT(*) as total FROM analytics.fanmilk_clean_history;
    `).catch(() => ({ rows: [{ total: 'TABLE_NON_EXISTANTE' }] }));

    // 2. Vérifier la matrice de contrôle des prix
    const matrixRes = await client.query(`
      SELECT COUNT(*) as total FROM analytics.product_price_matrix;
    `).catch(() => ({ rows: [{ total: 'TABLE_NON_EXISTANTE' }] }));

    // 3. Inspecter les colonnes pour valider le schéma
    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'analytics' AND table_name = 'fanmilk_clean_history';
    `).catch(() => ({ rows: [] }));

    console.log('\n📊 === RAPPORT D\'ÉTAT DU NOUVEAU SUPABASE ===');
    console.log(`🔹 Lignes dans 'fanmilk_clean_history' : ${historyRes.rows[0].total}`);
    console.log(`🔹 Lignes dans 'product_price_matrix'     : ${matrixRes.rows[0].total}`);
    
    if (columnsRes.rows.length > 0) {
      console.log('\n📋 Structure détectée pour l\'historique :');
      console.table(columnsRes.rows);
    } else {
      console.log('\n⚠️ Le schéma ou la table n\'existe pas encore sur cette instance.');
    }

  } catch (error) {
    const err = error as any;
    console.error('❌ Impossible de se connecter en direct :', err?.message || err);
  } finally {
    if (client) client.release();
    await supabasePool.end();
    console.log('\n🔒 Déconnexion propre.');
  }
}

checkDatabaseState();