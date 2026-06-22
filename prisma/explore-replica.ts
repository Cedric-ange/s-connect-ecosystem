import { Pool } from 'pg';

const pool = new Pool({
  host: 'replica-pg-cloudsql.fieldproapp.com',
  port: 5432,
  database: 'civ__fanmilk_2',
  user: 'civ__fanmilk_2_readonly',
  password: 'EKCDdRXMlQsRNCe',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

async function runAggregationTest() {
  console.log('🚀 [Pipeline] Lancement du test d\'extraction et de nettoyage...');
  const client = await pool.connect();

  try {
    // Requête SQL de fusion : Jointure Header/Lines + Conversion des types TEXT en NUMERIC
    const query = `
      SELECT 
        v._customer_id as customer_id,
        v.customer_name,
        v.channel,
        sku._name as product_name,
        sku._brand as brand,
        -- Force le nettoyage des colonnes textuelles en vrais nombres
        SUM(NULLIF(regexp_replace(sku.quantity, '[^0-9.]', '', 'g'), '')::numeric) as clean_total_quantity,
        SUM(sku.total_price) as clean_total_amount,
        COUNT(DISTINCT v.submission_id) as total_orders
      FROM v2_transfo_ventes_sku sku
      INNER JOIN v2_transfo_ventes v ON sku.submission_id = v.submission_id
      WHERE v.date >= '2025-01-01' -- On filtre sur l'historique récent pour le test
        AND v.customer_name IS NOT NULL
        AND sku._name IS NOT NULL
      GROUP BY v._customer_id, v.customer_name, v.channel, sku._name, sku._brand
      HAVING SUM(sku.total_price) > 0
      ORDER BY clean_total_amount DESC
      LIMIT 10;
    `;

    const res = await client.query(query);
    
    console.log('\n🎯 ÉCHANTILLON DE DONNÉES NETTOYÉES ET AGRÉGÉES (Prêt pour le ML) :');
    console.table(res.rows);

  } catch (error) {
    console.error('❌ Erreur dans le pipeline :', error);
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔒 Connexion fermée proprement.');
  }
}

runAggregationTest();