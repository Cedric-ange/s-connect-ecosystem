import { Pool } from 'pg';

const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fieldpro_civ_mirror',
  user: 'postgres',
  password: '@ngeToure1201',
});

async function analyzeLocalData() {
  console.log('📊 [Analyse Locale] Connexion au clone sur ton disque dur...');
  const client = await localPool.connect();

  try {
    const query = `
      SELECT 
        _brand as marque,
        _name as produit,
        COUNT(*) as nombre_de_ventes,
        SUM(NULLIF(regexp_replace(quantity, '[^0-9.]', '', 'g'), '')::numeric) as total_unites_vendues,
        ROUND(SUM(total_price)::numeric, 0) as chiffre_affaires_cfa,
        ROUND((SUM(total_price) / NULLIF(SUM(NULLIF(regexp_replace(quantity, '[^0-9.]', '', 'g'), '')::numeric), 0))::numeric, 2) as prix_unitaire_moyen_cfa
      FROM "v2_transfo_ventes_sku"
      WHERE _name IS NOT NULL AND total_price > 0
      GROUP BY _brand, _name
      ORDER BY total_unites_vendues DESC
      LIMIT 15;
    `;

    const res = await client.query(query);
    console.log('\n🎯 CATALOGUE PRODUITS FAN MILK EXTRAIT DE TON CLONE LOCAL :');
    console.table(res.rows);

  } catch (error) {
    console.error('❌ Erreur d\'analyse :', error);
  } finally {
    client.release();
    await localPool.end();
    console.log('\n🔒 Analyse terminée. Connexion locale fermée.');
  }
}

analyzeLocalData();